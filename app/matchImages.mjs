import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

function walkSync(dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(function(file) {
    if (fs.statSync(path.join(dir, file)).isDirectory()) {
      filelist = walkSync(path.join(dir, file), filelist);
    } else {
      filelist.push(path.join(dir, file));
    }
  });
  return filelist;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function cleanString(str) {
    if (!str) return '';
    return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
}

async function main() {
    console.log("Fetching moveis from database...");
    const { data: moveis, error } = await supabase.from('moveis').select('id, modelo, variante, fornecedor_id');
    if (error) {
        console.error("Error fetching moveis:", error);
        return;
    }
    
    console.log(`Found ${moveis.length} items in DB.`);
    
    const imageDir = path.resolve('../imagens');
    console.log(`Scanning images in ${imageDir}...`);
    const allFiles = walkSync(imageDir).filter(f => f.match(/\.(jpg|jpeg|png)$/i));
    console.log(`Found ${allFiles.length} images.`);
    
    const dbCleaned = moveis.map(m => ({
        ...m,
        cleanModelo: cleanString(m.modelo),
        cleanVariante: cleanString(m.variante),
        combined: cleanString(m.modelo + ' ' + (m.variante || ''))
    }));
    
    const mapping = [];
    const unmatched = [];
    
    for (const file of allFiles) {
        const basename = path.basename(file, path.extname(file));
        const cleanBase = cleanString(basename);
        
        // Find best match
        let bestMatch = null;
        let score = 0;
        
        for (const m of dbCleaned) {
            if (cleanBase.includes(m.cleanModelo) || m.cleanModelo.includes(cleanBase)) {
                let currentScore = 1;
                if (m.cleanVariante && (cleanBase.includes(m.cleanVariante) || m.cleanVariante.includes(cleanBase))) {
                    currentScore = 2; // Better match
                }
                
                if (currentScore > score) {
                    score = currentScore;
                    bestMatch = m;
                }
            } else if (cleanBase === m.combined) {
                bestMatch = m;
                score = 3; // Perfect stripped match
                break;
            }
        }
        
        if (bestMatch) {
            mapping.push(`[MATCH] Image: "${path.basename(file)}" -> Movel DB: ${bestMatch.modelo} ${bestMatch.variante ? `(${bestMatch.variante})` : ''} (ID: ${bestMatch.id})`);
        } else {
            unmatched.push(`[UNMATCHED] Image: "${path.basename(file)}"`);
        }
    }
    
    // Sort logic
    mapping.sort();
    unmatched.sort();
    
    const report = `# Relatório de De-Para (Imagens vs Banco de Dados)\n\n## Itens Mapeados com Sucesso (${mapping.length})\n\n${mapping.join('\n')}\n\n## Imagens Não Encontradas/Não Mapeadas no BD (${unmatched.length})\n\n${unmatched.join('\n')}`;
    
    fs.writeFileSync('../mapped_images_report.md', report);
    console.log('Report saved to ../mapped_images_report.md');
}

main();
