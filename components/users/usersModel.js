var { PrismaClient } = require('@prisma/client');
var prisma = new PrismaClient();

var findUserByUsername = async (username) => {
    if(!username) {
        throw new Error ('Username is required');
    }

    return prisma.user.findUnique({where: {username}});
};

var findUserByEmail = async (email) => {
    if(!email) {
        throw new Error ('Email is required');
    }

    return prisma.user.findUnique({where: {email}});
};

var createUser = async (username, email, hasedPassword) => {
    return prisma.user.create({
        data: {username, email, password: hasedPassword},
    });
};

module.exports = {findUserByUsername, findUserByEmail, createUser};
