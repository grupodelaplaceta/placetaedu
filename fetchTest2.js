fetch("http://localhost:3000/api/students/HJKH-1234").then(r => r.text()).then(console.log).catch(console.error);
