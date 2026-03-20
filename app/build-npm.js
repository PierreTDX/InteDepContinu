import { execSync } from 'child_process';
import fs from 'fs';

console.log("🚀 Démarrage du build NPM...");

try {
    console.log("🧹 Nettoyage du dossier lib...");
    fs.rmSync('lib', { recursive: true, force: true });

    console.log("🔨 Compilation avec Babel...");

    const ignorePatterns = [
        "**/pages",
        "**/assets",
        "**/main.jsx",
        "**/App.jsx",
        "**/App.css",
        "**/index.css"
    ].join(",");

    execSync(`npx babel src --out-dir lib --copy-files --no-copy-ignored --ignore "${ignorePatterns}"`, { stdio: 'inherit' });

    console.log("📝 Création du package.json pour CommonJS...");
    fs.writeFileSync('lib/package.json', JSON.stringify({ type: 'commonjs' }, null, 2));

    console.log("📄 Copie du README.md...");
    fs.copyFileSync('./NPM_README.md', './README.md');

    console.log("✨ Nettoyage final des résidus...");
    ['lib/App.css', 'lib/index.css', 'lib/pages', 'lib/assets'].forEach(item => {
        fs.rmSync(item, { recursive: true, force: true });
    });

    console.log("✅ Build NPM terminé avec succès !");
} catch (error) {
    console.error("❌ Erreur lors du build :", error.message);
    process.exit(1);
}