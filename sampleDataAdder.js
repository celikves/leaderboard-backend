import http from 'k6/http';
import { check, sleep } from 'k6';
import { randomItem } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const pantheonNames = [
    "Barış Şaraldı", "İsmail Bakır", "Furkan Atılgan", "Alperen Aydaş", "Alparslan İ.",
    "Osman Pekaydın", "Muhammet Ozdamar", "Muharrem Dedeoğlu", "Batuhan Köroğlu",
    "Osman Dursun", "Muhammet Can Şanverdi", "Ahmet Ugur", "Utku Mert Degirmenci",
    "Çağkan Çağlayanel", "Fulya Furuncuoglu", "Anı AKDEMİR", "Muhammed Bilal Bark",
    "Uğur Akıncı", "Cahit Burak Küçüksütcü", "Setenay Ünügür", "Barış Türemiş",
    "Necati Yasin Sezgin", "Hakan Demiral", "Mustafa Vardalı", "Yigit Kaan Cetin",
    "Rüzgar Bayındır", "Emir Berkay ÖZKAN", "Dogacan Tugrul", "Furkan Yami",
    "Hasan Emre Tonguç", "Kaan Sümer Kürkçüoğlu", "Onur Kurugol", "Kaya Dağlı",
    "Serhat İşbilir", "Yiğitcan Öksüz", "Meriç Kıranoğlu", "Fatih Çil",
    "Özlem Çetin Kuş", "Dorukhan Doruk", "Mustafa Tat", "Furkan Taylan Okay",
    "Abdurrahim AKPINAR", "Şuheda Bakan", "Hüseyin Oğuz Kahveci", "Ufuk Şahin",
    "Ayberk ESER", "İlknur Ercan", "Can Biçer", "Barış Runyun", "Zeki Özdemir",
    "Kamil Can Atar", "Tolunay Kus", "Hasan Uğur ÇAKMAKÇIOĞLU", "Zehra Çakmak Ertürk",
    "Onur Kaan Şahin", "S. Sercan Cengiz", "Yiğitcan Erden", "O. Doğukan Demirel",
    "Pınar Yalçınkaya", "Ahmet Burhanettin Şan", "Birtan Gülmüş", "Hilal İpek",
    "Şafak Akcan", "Mehmet Sarioglu", "Deniz Can Demir", "Büşra Kaya",
    "Ceren Sakoğlu", "Mutlu KILIÇ", "Oğuz Han Dede", "Zümrüt Tanrıöven",
    "Enes Koç", "Erdogan Cayir", "Altuğ Çataklı", "Mucahid GOK", "Mustafa Derin",
    "Melih Başyildiz", "Bilal Bahadır Gökçe", "Ahmet Emre Gürcan", "Ayvaz Arık",
    "Alp Eren Özdemir", "Bartu Baş", "Aysu Fenerci", "Eymen Güler",
    "Bahar Karaca Erol", "Mehmetcan Öksüz", "Umut Cetin Sagdicoglu", "Mert G.",
    "Tayfun SAKOĞLU", "Ivan Bylik", "Uygur Güvel", "Devrim Kutlu",
    "Oğuzhan Ercan", "Gökberk İnan", "İdil Tufan", "Ida Marie Solli"
];

const countries = ["Turkey", "Germany", "USA", "France", "Italy", "Spain", "Canada"];

export const options = {
    vus: 10, // Number of virtual users
    iterations: 200, // Total number of requests to be made
};


export default function () {
    // Generate random player name and country
    const playerName = randomItem(pantheonNames);
    const playerCountry = randomItem(countries);

    // Step 1: Add player
    const addPlayerResponse = http.post('http://localhost:3005/api/players/add', JSON.stringify({
        name: playerName,
        country: playerCountry,
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    const playerId = addPlayerResponse.json('player.playerId');
    if (!playerId) {
        console.error('Player ID not found in the response:', addPlayerResponse.body);
        return;
    }

    const randomEarnings = Math.floor(Math.random() * 10000) + 100;
    http.post(`http://localhost:3005/api/leaderboard/add-earnings/${playerId}`, JSON.stringify({
        earnings: randomEarnings,
    }), {
        headers: { 'Content-Type': 'application/json' },
    });

    sleep(1);
}
