async function testFetch() {
  console.log("Sending request to backend...");
  try {
    const response = await fetch("https://fintera-aquaculture-bckend.onrender.com/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json"
      },
      body: "username=admin001&password=admin"
    });

    console.log("Status Code:", response.status);
    console.log("Headers:", Object.fromEntries(response.headers.entries()));
    const bodyText = await response.text();
    console.log("Response Body:", bodyText);
  } catch (error) {
    console.error("Fetch failed error:", error);
  }
}

testFetch();






