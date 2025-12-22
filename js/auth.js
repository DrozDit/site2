window.app.auth = {
  currentUser: JSON.parse(localStorage.getItem('currentUser')) || null,


  updateAuthUI() {
    const authButtons = document.querySelector('.auth-buttons');
    if (this.currentUser) {
      authButtons.innerHTML = `<span style="color:#d1b3ff">Привет, ${this.currentUser.username}!</span>`;
    } else {
      authButtons.innerHTML = `
        <button id="loginBtn" class="btn auth-btn">Войти</button>
        <button id="registerBtn" class="btn auth-btn">Регистрация</button>
      `;
      document.getElementById('loginBtn')?.addEventListener('click', () => window.app.auth.openLoginModal());
      document.getElementById('registerBtn')?.addEventListener('click', () => window.app.auth.openRegisterModal());
    }
  },


  openLoginModal() {
    document.getElementById('loginModal').style.display = 'flex';
  },
  closeLoginModal() {
    document.getElementById('loginModal').style.display = 'none';
    document.getElementById('loginError').style.display = 'none';
  },
  openRegisterModal() {
    document.getElementById('registerModal').style.display = 'flex';
  },
  closeRegisterModal() {
    document.getElementById('registerModal').style.display = 'none';
    document.getElementById('registerError').style.display = 'none';
  },





  init() {
    this.updateAuthUI();

    document.getElementById('loginForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      const password = document.getElementById('loginPassword').value;

      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.username === username && u.password === password);

      if (user) {
        this.currentUser = { username: user.username };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.closeLoginModal();
        this.updateAuthUI();
      } else {
        document.getElementById('loginError').textContent = 'Неверный логин или пароль';
        document.getElementById('loginError').style.display = 'block';
      }
    });


    document.getElementById('registerForm')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('regEmail').value.trim();
      const username = document.getElementById('regUsername').value.trim();
      const password = document.getElementById('regPassword').value;
      const password2 = document.getElementById('regPassword2').value;

      const errorEl = document.getElementById('registerError');

      if (!email.includes('@')) {
        errorEl.textContent = 'Некорректный email';
        errorEl.style.display = 'block';
        return;
      }

      if (password !== password2) {
        errorEl.textContent = 'Пароли не совпадают';
        errorEl.style.display = 'block';
        return;
      }

      const users = JSON.parse(localStorage.getItem('users')) || [];
      if (users.some(u => u.username === username)) {
        errorEl.textContent = 'Логин уже занят';
        errorEl.style.display = 'block';
        return;
      }

      users.push({ email, username, password });
      localStorage.setItem('users', JSON.stringify(users));
      this.currentUser = { username };
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));

      this.closeRegisterModal();
      this.updateAuthUI();
    });
  }
};