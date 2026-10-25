const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const backupFolder = path.join(__dirname, 'yedekler');

function resolveMysqldumpPath() {
  if (config.database.mysqldumpPath && config.database.mysqldumpPath.trim() !== '') {
    if (fs.existsSync(config.database.mysqldumpPath)) {
      return config.database.mysqldumpPath;
    }
  }

  const provider = (config.database.provider || '').toLowerCase().trim();
  const drives = ['C:', 'D:', 'E:', 'F:'];

  for (const drive of drives) {
    if (provider === 'xampp') {
      const candidates = [
        path.join(drive, 'xampp', 'mysql', 'bin', 'mysqldump.exe'),
        path.join(drive, 'Program Files', 'xampp', 'mysql', 'bin', 'mysqldump.exe')
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) return p;
      }
    } else if (provider === 'appserv') {
      const candidates = [
        path.join(drive, 'AppServ', 'MySQL', 'bin', 'mysqldump.exe')
      ];
      for (const p of candidates) {
        if (fs.existsSync(p)) return p;
      }
    }
  }

  for (const drive of drives) {
    const generalCandidates = [
      path.join(drive, 'xampp', 'mysql', 'bin', 'mysqldump.exe'),
      path.join(drive, 'AppServ', 'MySQL', 'bin', 'mysqldump.exe'),
      path.join(drive, 'Program Files', 'MySQL', 'MySQL Server 8.0', 'bin', 'mysqldump.exe')
    ];
    for (const p of generalCandidates) {
      if (fs.existsSync(p)) return p;
    }
  }

  return 'mysqldump';
}

function getTimestamp() {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
}

async function cleanupOldBackups() {
  try {
    if (!fs.existsSync(backupFolder)) return;

    const maxBackups = Number(config.backup.maxLocalBackups) || 3;

    const files = fs.readdirSync(backupFolder)
      .filter((file) => file.endsWith('.zip') || file.endsWith('.sql'))
      .map((file) => {
        const filePath = path.join(backupFolder, file);
        return {
          name: file,
          path: filePath,
          time: fs.statSync(filePath).mtime.getTime()
        };
      })
      .sort((a, b) => a.time - b.time);

    if (files.length > maxBackups) {
      const deleteCount = files.length - maxBackups;
      const filesToDelete = files.slice(0, deleteCount);

      filesToDelete.forEach((f) => {
        if (fs.existsSync(f.path)) {
          fs.unlinkSync(f.path);
          console.log(`[TEMİZLEME] Eski yedek silindi: ${f.name}`);
        }
      });
    }
  } catch (err) {
    console.error('[HATA] Yedek temizleme hatası:', err.message);
  }
}

function backupAndZip() {
  return new Promise((resolve, reject) => {
    const executable = resolveMysqldumpPath();
    if (!fs.existsSync(backupFolder)) {
      fs.mkdirSync(backupFolder, { recursive: true });
    }

    const timestamp = getTimestamp();
    const tempSqlFile = path.join(backupFolder, `${config.database.name}_${timestamp}.sql`);
    const zipFileName = `Berk_${config.database.name}_${timestamp}.zip`;
    const zipFilePath = path.join(backupFolder, zipFileName);

    const dumpArgs = [
      `--host=${config.database.host}`,
      `--port=${config.database.port}`,
      `-u${config.database.user}`,
      '--single-transaction',
      '--quick',
      '--routines',
      '--triggers',
      config.database.name
    ];

    const child = spawn(executable, dumpArgs, {
      env: { ...process.env, MYSQL_PWD: config.database.password },
      windowsHide: true
    });

    const writeStream = fs.createWriteStream(tempSqlFile);
    child.stdout.pipe(writeStream);

    let stderrData = '';
    child.stderr.on('data', (d) => { stderrData += d.toString(); });

    child.on('close', (code) => {
      writeStream.end();

      if (code !== 0) {
        if (fs.existsSync(tempSqlFile)) fs.unlinkSync(tempSqlFile);
        return reject(new Error(`mysqldump hatası (${code}): ${stderrData.trim()}`));
      }

      const psCommand = `powershell -NoProfile -Command "Compress-Archive -Path '${tempSqlFile}' -DestinationPath '${zipFilePath}' -Force"`;

      exec(psCommand, async (psErr) => {
        if (fs.existsSync(tempSqlFile)) fs.unlinkSync(tempSqlFile);

        if (psErr) {
          if (fs.existsSync(zipFilePath)) fs.unlinkSync(zipFilePath);
          return reject(new Error(`Zip oluşturma hatası: ${psErr.message}`));
        }

        try {
          const stats = fs.statSync(zipFilePath);
          const sizeMb = (stats.size / 1024 / 1024).toFixed(2);
          
          await cleanupOldBackups();

          resolve({ filePath: zipFilePath, fileName: zipFileName, sizeMb, timestamp });
        } catch (err) {
          reject(err);
        }
      });
    });

    child.on('error', (err) => {
      if (fs.existsSync(tempSqlFile)) fs.unlinkSync(tempSqlFile);
      reject(err);
    });
  });
}

module.exports = { backupAndZip };