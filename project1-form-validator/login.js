const form = document.getElementById('form');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };


    const url = 'http://localhost:3000/api/auth/login';

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Авторизация прошла успешно') {
                localStorage.setItem('token', data.token); // Сохраняем токен
                window.location.href = './index2.html';
            }
            // Обработка успешного ответа
            else {
                alert('Неверный логин или пароль!');
                document.getElementById("loginError").innerHTML="Ошибка"
            }
        })
        .catch(error => {
            console.error('Ошибка:', error);
            alert('Произошла ошибка при отправке данных.');
        });
    
});

