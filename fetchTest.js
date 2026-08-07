fetch("http://localhost:3000/api/students").then(r => r.text()).then(console.log).catch(console.error);
