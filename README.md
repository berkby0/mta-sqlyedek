**MTA:SA SQL Yedekleme Botu**

# Multi Theft Auto (MTA:SA) sunucunuz için çalışan, zip sıkıştırmalı Discord SQL yedekleme botu. İyi kullanımlar!

### 🛠️ Kurulum

```text
1. "config.js" dosyasını açıp bot tokenı, kanal ID ve MTA veritabanı bilgilerinizi giriniz.

2. Terminal veya CMD açıp "npm i" yazarak modülleri kurunuz.

3. "baslat.bat" dosyasına çift tıklayarak veya terminale "node index.js" yazarak botu başlatınız.
```

### 🚀 Özellikler

* **Otomatik & Manuel Yedek:** Belirlediğiniz süre aralıklarında otomatik veya `.yedek` komutu ile anlık manuel yedek alma.
* **Akıllı Zip Sıkıştırma:** Veritabanını ham `.sql` yerine `.zip` formatında sıkıştırarak Discord limitlerini korur.
* **Disk Temizleyici:** `config.js` içerisindeki `maxLocalBackups` sınırına göre eski yedekleri klasörden otomatik temizler.
* **Çoklu Sağlayıcı:** XAMPP ve AppServ konumlarını disk üzerinde otomatik olarak bulur.
* **Yetki Koruması:** Manuel yedek alma komutu yalnızca `Yönetici` (Administrator) yetkisine sahip yetkililere açıktır.
