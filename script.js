function openChat() {
  document.getElementById("chatbox").style.display = "flex";
}

function sendMsg() {
  const input = document.getElementById("userInput");
  const msg = input.value.trim();
  if (!msg) return;

  addMsg("You", msg);
  input.value = "";

  setTimeout(() => {
    addMsg("AK AI", aiReply(msg));
  }, 600);
}

function addMsg(sender, text) {
  const box = document.getElementById("messages");
  const div = document.createElement("div");
  div.innerHTML = `<strong>${sender}:</strong> ${text}`;
  div.style.marginBottom = "10px";
  box.appendChild(div);
  box.scrollTop = box.scrollHeight;
}

function aiReply(msg) {
  msg = msg.toLowerCase();
  if (msg.includes("price")) return "Please tell me which item you want pricing for.";
  if (msg.includes("delivery")) return "We provide fast delivery inside Doha within 24 hours.";
  if (msg.includes("location")) return "We are located in Doha, Qatar.";
  return "Welcome to AK Boutique. How can I assist you today?";
}
