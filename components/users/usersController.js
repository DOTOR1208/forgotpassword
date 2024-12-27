const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { findUserByUsername, findUserByEmail, createUser, } = require('./usersModel');
const crypto = require('crypto');

//Có thể phải nằm trong Module(gồm post resetpassword)? [post dưới(post resetpassword) thay đổi dữ liệu DB]
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
//*******************************//


const getRegister = (req, res) => {
    res.render('register', { title: 'Register' });
};

const postRegister = async (req, res) => {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !password || !email || !confirmPassword) {
        return res.render('register', { error: 'All fields are required', title: 'Register' });
    }

    if (password !== confirmPassword) {
        return res.render('register', { error: 'Confirm password must be the same as password', title: 'Register' });
    }

    try {
        const existUser = await findUserByUsername(username);
        if (existUser) {
            return res.render('register', { error: 'Username already exists', title: 'Register' });
        }

        const existEm = await findUserByEmail(email);
        if (existEm) {
            return res.render('register', { error: 'Email already exists', title: 'Register' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await createUser(username, email, hashedPassword);

        res.redirect('/users/login');
    } catch (error) {
        console.error(error);
        res.render('register', { error: 'Something went wrong', title: 'Register' });
    }
};

const getLogin = (req, res) => {
    res.render('login', { title: 'Login' });
};

const postLogin = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !password || !email) {
        return res.render('login', { error: 'All fields are required', title: 'Login' });
    }

    try {
        const user = await findUserByUsername(username);
        if (!user) {
            return res.render('login', { error: 'Invalid Username', title: 'Login' });
        }

        const em = await findUserByEmail(email);
        if (!em) {
            return res.render('login', { error: 'Invalid Email', title: 'Login' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Invalid Password', title: 'Login' });
        }

        res.redirect('/');
    } catch (error) {
        console.error(error);
        res.render('login', { error: 'Something went wrong', title: 'Login' });
    }
};

// FORGOT PASSWORD HANDLING

// Hàm tạo token reset mật khẩu
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

const getForgotPassword = (req, res) => {
    const error = req.session.error;
    const success = req.session.success;

    req.session.error = null;
    req.session.success = null;

    res.render('forgotpassword', { error, success });
};

const postForgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        req.session.error = "Please enter an email.";
        return res.redirect('/users/forgotpassword');
    }

    try {
        // Tìm người dùng theo email
        const user = await findUserByEmail(email);

        // Không tìm thấy người dùng, thông báo
        if (!user) {
            req.session.error = "Email is not registered.";
            return res.redirect('/users/forgotpassword');
        }

        // Tạo token reset mật khẩu
        const resetToken = generateResetToken();

        const expires = new Date();
        expires.setHours(expires.getHours() + 1); // Token sẽ hết hạn sau 1 giờ

        // Lưu token và thời gian hết hạn vào cơ sở dữ liệu
        await prisma.user.update({
            where: { email },
            data: {
                resetPasswordToken: resetToken,
                resetPasswordExpires: expires,
            },
        });

        // Gửi email với link reset mật khẩu cùng endpoint là token
        const resetLink = `http://localhost:3000/users/resetpassword/${resetToken}`;

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com', //Có thể dùng tài khoản khác
            port: 587,
            secure: false,
            auth: {
                user: 'bao2004dt@gmail.com', //Đây là mail thậtthật, mật khẩu dưới là app password (ko phải mật khẩu riêng) xóa được
                pass: 'irny gfhu dhoq hegk',
            },
        });

        const mailOptions = {
            from: 'bao2004dt@gmail.com',
            to: email,
            subject: 'Password Reset Request',
            text: `Click the link below to reset your password:\n\n${resetLink}\n\nThe link will expire in 1 hour.`,
        };

        // Gửi email
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error("Error details:", error);
                req.session.error = "Failed to send email. Please try again.";
            } else {
                console.log('Email sent: ' + info.response);
                req.session.success = "Password reset link has been sent to your email.";
            }
            res.redirect('/users/forgotpassword');
        });
    } catch (error) {
        console.error(error);
        req.session.error = "Something went wrong. Please try again later.";
        res.redirect('/users/forgotpassword');
    }
};

// Hiển thị form đổi mật khẩu
const getResetPassword = async (req, res) => {
    const { token } = req.params;

    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gte: new Date(), // Token chưa hết hạn
                },
            },
        });

        if (!user) {
            req.session.error = "Invalid or expired token.";
            return res.redirect('/users/forgotpassword');
        }

        res.render('resetpassword', { token });
    } catch (error) {
        console.error(error);
        req.session.error = "Something went wrong.";
        res.redirect('/users/forgotpassword');
    }
};

// Cập nhật mật khẩu mới
const postResetPassword = async (req, res) => {
    const { token, password, confirmPassword } = req.body;

    if (!password || !confirmPassword || password !== confirmPassword) {
        req.session.error = "Passwords do not match."; //Mật khẩu không trùng 
        return res.redirect('back');
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: {
                    gte: new Date(),
                },
            },
        });

        if (!user) {
            req.session.error = "Invalid or expired token.";
            return res.redirect('/users/forgotpassword');
        }

        // Mã hóa mật khẩukhẩu
        const hashedPassword = await bcrypt.hash(password, 10);

        // Cập nhật mật khẩu và xóa token
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                resetPasswordToken: null,
                resetPasswordExpires: null,
            },
        });

        req.session.success = "Password updated successfully. You can now log in.";
        res.redirect('/users/forgotpassword');
    } catch (error) {
        console.error(error);
        req.session.error = "Something went wrong.";
        res.redirect('back');
    }
};

module.exports = {
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    getForgotPassword,
    postForgotPassword,
    generateResetToken,
    getResetPassword,
    postResetPassword
};
