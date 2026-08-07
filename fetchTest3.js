fetch("http://localhost:3000/api/courses").then(r => r.text()).then(console.log).catch(console.error);
