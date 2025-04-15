const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
require('dotenv').config();
//регистрация пользователя
exports.register = async (req, res) => {
    const { username, email, password } = req.body;

    try {
        //проверка на существование пользователя
        const UserExists = await pool.query('SELECT * FROM public.users WHERE email = $1', [email]);
        if (UserExists.rows.length !== 0) {
            return res.status(400).json({ message: 'Пользователь уже существует' });
        }

        //хеширование пароля
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //создание пользователя
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING *',
            [username, email, hashedPassword]
        );
        res.status(201).json({ message: 'Пользователь создан', user: newUser.rows[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Ошибка сервера' });
    }
};

//вход пользователя
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        //проверка на существование пользователя
        const user = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (user.rows.length === 0) {
            return res.status(400).json({message: 'Неверный логин или пароль'});
        }

        //проверка пароля
        const validPassword = await bcrypt.compare(password, user.rows[0].password);
        if (!validPassword) {
            return res.status(400).json({message: 'Неверный логин или пароль'});
        }

        //генерация jwt 
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({message: 'Авторизация прошла успешно', token});
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message: 'Ошибка сервера'});
    }
};