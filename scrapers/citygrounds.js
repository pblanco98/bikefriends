// -Get html for citygrounds website 
// -select the class for bikes
// -loop over the html elements
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const { Client } = require('pg');
const client = new Client();

client.connect(err => {
    if (err) {
      console.error('connection error', err.stack)
    } else {
      console.log('connected')
    }
  })

// const main = async () => {
//     const bikes = []
//     for(i=1;i<=5;i++){
//         const API_URL = `https://www.citygrounds.com/collections/bicycles-bikes?page=${i}`
//         // console.log(API_URL)
//         const res = await fetch(API_URL, {
//             method: 'GET'
//         })
//         const body = await res.text()
//         const $ = cheerio.load(body)

//         $('p.grid-link__title').each(function(i, elem) {
//             bikes.push($(this).text())

//         });
//         // console.log('network requests')
//         // console.log(bikes)
   
//     }
//     // console.log('main')
//     console.log(bikes);
// } 
// main()


const main = async () => {
    const frames = []
    const API_URL = 'https://www.citygrounds.com/collections/bike-frames-framesets'
    // console.log(API_URL)
    const res = await fetch(API_URL, {
        method: 'GET'
    })
    const body = await res.text()
    const $ = cheerio.load(body)

    $('p.grid-link__title').each(async function(i, elem) {
        const frame_name = $(this).text()
        frames.push(frame_name)
        console.log({frame_name})
        const sqlCommand = `insert into bike_parts(part, name) values ('frame', '${frame_name}') returning id`
        const dbRes = await client.query(sqlCommand)
        // console.log(dbRes)
    });

    console.log(frames);
} 
main()


// id,parts,label
// 1,'frame','Haro SDv2'
// 2,'frame'
// 3.'frame'
// ...
// 56,'wheels'
// 57,'frame','new frame'
// 58,'handlebars',''

// id,frame,wheels,handlebars
// 1,'Haro SDv2',NULL
// 2,NULL,'Aventon Wheel'
