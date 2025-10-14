

document.getElementById("biodataForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Get all form data
  const formData = Object.fromEntries(new FormData(e.target).entries());

  // Call the backend function (Vercel serverless)
  const res = await fetch("/api/submit", {  // <-- use this exactly
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData),
  });

  const message = await res.text();  // get response from backend
  alert(message);                     // show success or error
  e.target.reset();                   // clear the form
});
