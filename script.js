// Importando Firebase (v12+ modular)
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.3.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  onSnapshot, 
  deleteDoc, 
  doc, 
  updateDoc 
} from "https://www.gstatic.com/firebasejs/12.3.0/firebase-firestore.js";

// 🔧 Seu firebaseConfig
const firebaseConfig = {
  apiKey: "AIzaSyDR7LC1tYz79vPzX8Z5WSVMpTU6z-xlKPY",
  authDomain: "estoque-ti1.firebaseapp.com",
  projectId: "estoque-ti1",
  storageBucket: "estoque-ti1.firebasestorage.app",
  messagingSenderId: "733253906946",
  appId: "1:733253906946:web:8992110e65d1c0369f6d1b"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referências DOM
const loginSection = document.getElementById("login-section");
const appSection = document.getElementById("app");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.getElementById("loginBtn");
const registerBtn = document.getElementById("registerBtn");
const logoutBtn = document.getElementById("logoutBtn");
const produtoInput = document.getElementById("produto");
const quantidadeInput = document.getElementById("quantidade");
const adicionarBtn = document.getElementById("adicionar");
const listaProdutos = document.getElementById("lista-produtos");

// Registro de usuário
registerBtn.addEventListener("click", async () => {
  try {
    await createUserWithEmailAndPassword(auth, email.value, password.value);
    alert("Usuário registrado!");
  } catch (error) {
    alert(error.message);
  }
});

// Login
loginBtn.addEventListener("click", async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
  } catch (error) {
    alert("Erro no login: " + error.message);
  }
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// Verifica se usuário está logado
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginSection.style.display = "none";
    appSection.style.display = "block";
    carregarEstoque();
  } else {
    loginSection.style.display = "block";
    appSection.style.display = "none";
  }
});

// Adicionar produto
adicionarBtn.addEventListener("click", async () => {
  const nome = produtoInput.value;
  const quantidade = parseInt(quantidadeInput.value);

  if (nome && quantidade > 0) {
    try {
      await addDoc(collection(db, "estoque"), {
        nome: nome,
        quantidade: quantidade,
        usuario: auth.currentUser.email,
        data: new Date().toISOString()
      });
      produtoInput.value = "";
      quantidadeInput.value = "";
    } catch (error) {
      alert("Erro ao adicionar: " + error.message);
    }
  } else {
    alert("Preencha os campos corretamente!");
  }
});

// Carregar estoque em tempo real
function carregarEstoque() {
  onSnapshot(collection(db, "estoque"), (snapshot) => {
    listaProdutos.innerHTML = "";
    snapshot.forEach((docItem) => {
      const item = docItem.data();
      const li = document.createElement("li");

      // Texto do item
      const texto = document.createElement("span");
      texto.textContent = `${item.nome} - ${item.quantidade} unidades (por ${item.usuario})`;

      // Botão editar
      const btnEditar = document.createElement("button");
      btnEditar.textContent = "✏️ Editar";
      btnEditar.style.marginLeft = "10px";
      btnEditar.onclick = async () => {
        const novaQtd = prompt(`Digite nova quantidade para ${item.nome}:`, item.quantidade);
        if (novaQtd !== null && !isNaN(novaQtd) && novaQtd > 0) {
          await updateDoc(doc(db, "estoque", docItem.id), { quantidade: parseInt(novaQtd) });
        }
      };

      // Botão remover
      const btnRemover = document.createElement("button");
      btnRemover.textContent = "🗑️ Remover";
      btnRemover.style.marginLeft = "5px";
      btnRemover.onclick = async () => {
        if (confirm(`Tem certeza que deseja remover ${item.nome}?`)) {
          await deleteDoc(doc(db, "estoque", docItem.id));
        }
      };

      li.appendChild(texto);
      li.appendChild(btnEditar);
      li.appendChild(btnRemover);
      listaProdutos.appendChild(li);
    });
  });
}
