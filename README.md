# Virke

Ammattikoulun englanti suomeksi. Jokaisella alalla on tutkintonimikkeet, työn sanat ja työtilanteet. Kielioppiharjoitus pysyy erikseen ja painottaa kohtia, joissa suomi ja englanti eroavat.

Tutkintonimikkeiden englanti on tarkistettu Opintopolun tutkintonimikeluettelosta. Jos työpaikalla käytetään eri sanaa, se on merkitty ilman tutkintonimike-merkintää. Kieli on brittienglantia.

Tili ja edistyminen tallentuvat vain tähän selaimeen. Salasana tallennetaan tiivisteenä. Varmuuskopio (JSON) siirtää tilin toiseen koneeseen. Mitään ei lähetetä palvelimelle.

## Käynnistys

```bash
npm install
npm run dev
```

Avaa [http://localhost:3000](http://localhost:3000).

Testit:

```bash
npm test
```

## Näin harjoittelu toimii

1. Valitse ala. Sivulla on nimikkeet, sanasto ja kolme harjoitusta: työtilanteet, nimikkeet ja sanat.
2. Tasotesti kysyy yhden kielioppitehtävän jokaisesta kahdestatoista aiheesta.
3. Adaptiivinen kierros painottaa heikkoja kieliopin aiheita. Alan tehtävät eivät muuta sitä tasoa.
4. Jokaisesta vastauksesta tulee sääntö, selitys ja esimerkki.
5. Luo tili, jos haluat pitää edistymisen omalla nimellä samalla koneella.

Arvio ei ole virallinen kielikoe.
