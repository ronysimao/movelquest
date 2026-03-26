import io
import pandas as pd
from supabase import create_client, Client
import logging

logging.basicConfig(level=logging.INFO)
log = logging.getLogger("catalog_etl")

class CatalogETL:
    def __init__(self, url: str, key: str):
        self.supabase: Client = create_client(url, key)

    def extract_xlsx(self, file_bytes: bytes) -> pd.DataFrame:
        """Extract data from XLSX using pandas."""
        df = pd.read_excel(io.BytesIO(file_bytes))
        return df

    def load_bronze(self, vendor_id: int, carga_id: int, df: pd.DataFrame, source_type: str = 'xlsx') -> str:
        """Load raw data into the Bronze layer (raw_imports)."""
        payload = df.to_dict(orient='records')
        res = self.supabase.table("raw_imports").insert({
            "vendor_id": vendor_id,
            "carga_id": carga_id,
            "payload_bruto": payload,
            "source_type": source_type,
            "status": "pending"
        }).execute()
        return res.data[0]['id']

    def get_mappings(self, vendor_id: int) -> dict:
        """Fetch field mappings for a specific vendor."""
        res = self.supabase.table("field_mappings").eq("vendor_id", vendor_id).execute()
        return {item['raw_key']: item for item in res.data}

    def transform_and_load_silver(self, vendor_id: int, carga_id: int, df: pd.DataFrame, import_id: str):
        """Map, normalize and load into Silver/Gold layer (products)."""
        mappings = self.get_mappings(vendor_id)
        standardized_records = []

        for _, row in df.iterrows():
            specs = {}
            dimensions = {"h": 0, "w": 0, "d": 0, "unit": "cm"}
            sku = None
            name = None
            category = None

            for raw_key, value in row.items():
                if pd.isna(value): continue
                
                mapping = mappings.get(raw_key)
                if mapping:
                    std_key = mapping['standard_key']
                    multiplier = mapping.get('unit_multiplier', 1)
                    
                    # Apply multiplier if numeric
                    try:
                        val = float(value) * float(multiplier)
                    except:
                        val = value

                    if std_key == 'sku': sku = str(val)
                    elif std_key == 'name': name = str(val)
                    elif std_key == 'category': category = str(val)
                    elif std_key in ['height', 'width', 'depth']:
                        dim_map = {'height': 'h', 'width': 'w', 'depth': 'd'}
                        dimensions[dim_map[std_key]] = val
                    else:
                        specs[std_key] = val
                else:
                    # Log unmapped field or store in generic specs
                    specs[raw_key] = value

            if sku and name:
                standardized_records.append({
                    "sku": sku,
                    "name": name,
                    "vendor_id": vendor_id,
                    "carga_id": carga_id, # Tagging with carga_id
                    "main_category": category,
                    "technical_specs": specs,
                    "dimensions": dimensions,
                })

        # Upsert into products
        if standardized_records:
            self.supabase.table("products").upsert(standardized_records, on_conflict="sku").execute()
            # Update bronze status
            self.supabase.table("raw_imports").update({"status": "processed"}).eq("id", import_id).execute()

def main(supabase_url: str, supabase_key: str, vendor_id: int, carga_id: int, file_bytes: bytes):
    etl = CatalogETL(supabase_url, supabase_key)
    
    # 1. Extract
    df = etl.extract_xlsx(file_bytes)
    
    # 2. Bronze
    import_id = etl.load_bronze(vendor_id, carga_id, df)
    
    # 3. Transform & Silver/Gold
    etl.transform_and_load_silver(vendor_id, carga_id, df, import_id)
    
    return {"status": "success", "import_id": import_id}
