module.exports = {
    token: 'TOKEN', // Bot Token
    channelId: 'KANALID', // Sql Yedegin Atılacagı Kanal
    prefix: '.', // Prefix
    banner: '', // Banner linki (boş bırakılırsa eklenmez)

  // Veritabanı Bilgileri
  database: {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    name: ''
  },

    // Sağlayıcı Seçenekleri: 'xampp' | 'appserv'
    provider: '',
    // EĞER OTO BULAMAZSA BURAYA DİREKT EXE YOLUNU YAZABİLİRSİN (İsteğe bağlı)
    // Örnek: "C:\\xampp\\mysql\\bin\\mysqldump.exe"
    mysqldumpPath: '',

  // Yedekleme Ayarları
  backup: {
    intervalMinutes: 1, // Kaç dakikada bir otomatik yedek alsın
    maxLocalBackups: 5   // Klasörde saklanacak maksimum eski zip 
  }
};