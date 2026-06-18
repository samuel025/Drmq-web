const fs = require('fs');
const path = require('path');

const directoryPath = path.join(__dirname, 'src', 'pages');

fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 
    files.forEach(function (file) {
        if (file.endsWith('.tsx')) {
            const filePath = path.join(directoryPath, file);
            let content = fs.readFileSync(filePath, 'utf8');
            
            // Replace text-4xl
            content = content.replace(/text-4xl/g, 'text-3xl md:text-4xl');
            // Replace text-2xl
            content = content.replace(/text-2xl/g, 'text-xl md:text-2xl');
            // Replace text-lg
            content = content.replace(/text-lg/g, 'text-base md:text-lg');

            fs.writeFileSync(filePath, content, 'utf8');
        }
    });
});
console.log("Done updating text classes in pages.");
