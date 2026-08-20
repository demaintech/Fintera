async function run() {
  const url = "https://fintera-aquaculture-bckend.onrender.com/login";
  const tests = [
    {
      name: 'form: username',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({ username: 'admin001', password: 'admin' }).toString(),
      },
    },
    {
      name: 'form: email',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: new URLSearchParams({ email: 'admin001@example.com', password: 'admin' }).toString(),
      },
    },
    {
      name: 'json: email',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: 'admin001@example.com', password: 'admin' }),
      },
    },
    {
      name: 'json: username',
      options: {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ username: 'admin001', password: 'admin' }),
      },
    },
  ];

  for (const t of tests) {
    try {
      console.log('\n===', t.name, '===');
      const res = await fetch(url, t.options);
      console.log('Status:', res.status);
      const txt = await res.text();
      console.log('Body:', txt);
    } catch (err) {
      console.error('Request failed:', err);
    }
  }
}

run();
