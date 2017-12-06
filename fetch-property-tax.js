const request = require('request');

// NOTE We ended up having to switch to a domain that supports NBE.
// const endpoint = 'https://data.montgomerycountymd.gov/resource/tuqf-cska.json';
const endpoint = 'https://evergreen.data.socrata.com/resource/8pmw-84hj.json';

module.exports = function(address) {
  return new Promise((resolve, reject) => {

    const parts = address.toUpperCase().split(/\W+/); //.map(x => `'${x}'`);
    // const where = 'property_address IN ' + parts.join(' OR '));
    const select = 'SELECT property_address,bill_total';
    const where = `WHERE property_address IN (${parts.join(',')})`;

    const list = parts.map(x => `property_address LIKE "${x}"`).join(' OR ');

    console.log(`${select} ${where}`);

    // NOTE: The big hack we ended up having to do was to just
    //       pull all the rows (since our test dataset was small enough)
    //       and then manually search for a match.
    // const query = encodeURIComponent(`${select} ${where}`);
    const query = encodeURIComponent(`${select}`);

    const url = `${endpoint}?$query=${query}`;

    console.log('URL:', url);

    const req = request(url)
    req.on('response', (res) => {
      // Object.keys(res).forEach(key => console.log(key));
    });

    let raw = '';

    req.on('data', (data) => {
      raw += data.toString();
    });

    req.on('end', () => {
      const list = JSON.parse(raw);

      // HACK: Here is the biggest hack that had to be done.
      const sim = (addr) => {
        const y = addr.toUpperCase().split(/\W+/);
        let val = 0;
        for(let i = 0; i < y.length && i < parts.length; i++) {
          if(y[i] === parts[i]) {
            val++;
          }
        }
        return val;
      }

      // const test = parts.join(' ');
      list.sort((a, b) => {
        let s1 = sim(a.property_address);
        let s2 = sim(b.property_address);
        if (s1 > s2) return -1;
        if (s2 > s1) return 1;
        return 0;
      });

      resolve(list[0]);
    });

    req.on('error', (err) => {
      console.log('ERR:', err);
      reject(err);
    });
  });
};
