// Kerala's towns by district: municipalities, corporation areas and the main market towns.
// Not every village is here, so the form also lets a Medico type their own town.

export const KERALA_TOWNS: Record<string, string[]> = {
  Thiruvananthapuram: [
    "Thiruvananthapuram", "Neyyattinkara", "Nedumangad", "Attingal", "Varkala", "Kazhakkoottam", "Kattakada", "Balaramapuram",
    "Vizhinjam", "Kovalam", "Parassala", "Venjaramoodu", "Kilimanoor", "Vellarada",
  ],
  Kollam: [
    "Kollam", "Karunagappally", "Kottarakkara", "Punalur", "Paravur", "Chavara", "Kundara", "Anchal", "Sasthamcotta", "Kadakkal",
    "Pathanapuram", "Chathannoor", "Oachira",
  ],
  Pathanamthitta: ["Pathanamthitta", "Thiruvalla", "Adoor", "Pandalam", "Ranni", "Konni", "Kozhencherry", "Mallappally", "Kumbanad", "Elanthoor"],
  Alappuzha: [
    "Alappuzha", "Cherthala", "Kayamkulam", "Mavelikkara", "Chengannur", "Haripad", "Ambalappuzha", "Aroor", "Thuravoor", "Mannar",
    "Edathua", "Kuttanad",
  ],
  Kottayam: [
    "Kottayam", "Changanassery", "Pala", "Vaikom", "Ettumanoor", "Erattupetta", "Kanjirappally", "Mundakayam", "Pampady", "Ponkunnam",
    "Kuravilangad", "Kumarakom", "Uzhavoor",
  ],
  Idukki: [
    "Thodupuzha", "Kattappana", "Munnar", "Adimali", "Nedumkandam", "Painavu", "Cheruthoni", "Kumily", "Peermade", "Vandiperiyar",
    "Rajakkad", "Vandanmedu",
  ],
  Ernakulam: [
    "Kochi", "Ernakulam", "Fort Kochi", "Edappally", "Kakkanad", "Vyttila", "Thrippunithura", "Maradu", "Kalamassery", "Eloor", "Aluva",
    "Angamaly", "Perumbavoor", "Muvattupuzha", "Kothamangalam", "North Paravur", "Kolenchery", "Piravom", "Koothattukulam",
  ],
  Thrissur: [
    "Thrissur", "Guruvayur", "Chavakkad", "Kunnamkulam", "Chalakudy", "Kodungallur", "Irinjalakuda", "Wadakkanchery", "Kodakara", "Mala",
    "Ollur", "Pudukkad", "Vadanappally",
  ],
  Palakkad: [
    "Palakkad", "Ottapalam", "Shoranur", "Mannarkkad", "Chittur", "Cherpulassery", "Pattambi", "Alathur", "Vadakkencherry", "Kollengode",
    "Nemmara", "Koppam", "Agali",
  ],
  Malappuram: [
    "Malappuram", "Manjeri", "Perinthalmanna", "Tirur", "Ponnani", "Kottakkal", "Nilambur", "Kondotty", "Tanur", "Valanchery",
    "Parappanangadi", "Tirurangadi", "Chemmad", "Edappal", "Kuttippuram", "Areekode", "Wandoor", "Vengara",
  ],
  Kozhikode: [
    "Kozhikode", "Vadakara", "Koyilandy", "Ramanattukara", "Feroke", "Mukkam", "Koduvally", "Payyoli", "Thamarassery", "Balussery",
    "Perambra", "Kunnamangalam", "Nadapuram", "Kuttiady", "Mavoor",
  ],
  Wayanad: ["Kalpetta", "Mananthavady", "Sulthan Bathery", "Meenangadi", "Pulpally", "Vythiri", "Meppadi", "Panamaram", "Ambalavayal"],
  Kannur: [
    "Kannur", "Thalassery", "Payyannur", "Taliparamba", "Mattannur", "Iritty", "Kuthuparamba", "Panoor", "Anthoor", "Sreekandapuram",
    "Pazhayangadi", "Peravoor", "Alakode",
  ],
  Kasaragod: [
    "Kasaragod", "Kanhangad", "Nileshwaram", "Uppala", "Manjeshwaram", "Cheruvathur", "Trikaripur", "Bekal", "Kumbla", "Badiadka",
    "Vellarikundu",
  ],
};

export const townsIn = (district: string) => KERALA_TOWNS[district] ?? [];
