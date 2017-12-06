const fetch = require('./fetch-property-tax');

const address = '8807 leonard road';

fetch(address).then(data => {
  console.log('GOT: ', data);
})
.catch(err => {
  console.log('FAIL:', err);
});
