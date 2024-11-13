const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const prisma = new (require('@prisma/client').PrismaClient)();
const zod = require('zod');
require('dotenv').config();
const jwt_password = "password"

const registerSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6),
    name: zod.string().min(1),
});

const loginSchema = zod.object({
    email: zod.string().email(),
    password: zod.string().min(6)
});

exports.register = async (req, res) => {
    const { email, password, name } = req.body;
    const result = registerSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.errors
        });
    }
    const hashPassword = await bcrypt.hash(password, 9);

    try {
        const user = await prisma.user.create({
            data: {
                email,
                password: hashPassword,
                name
            }
        });

        const token = jwt.sign({ userId: user.id }, jwt_password, { expiresIn: "7d" });

        res.status(201).json({
            msg: "success!",
            token: token
        });
    } catch (error) {
        res.status(400).json({
            error: error.message
        });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            error: result.error.errors
        });
    }

    try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ userId: user.id }, jwt_password, { expiresIn: "7d" });

            res.status(200).json({
                token: token,
                id: user.id
            });
        } else {
            res.status(400).json({
                msg: "Incorrect email or password"
            });
        }
    } catch (error) {
        res.status(500).json({
            msg: error.message
        });
    }
};
