const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');

chai.use(chaiAsPromised);
const expect = chai.expect;

const UserController = require('../../app/controllers/user-controller');
const UserError = require('../../app/controllers/exceptions');
let userArray = [];

const fakeData = {
    users: {
        findByUsername(username) {
            return userArray.find((user) => user.username === username);
        },
        getAllUsernames() {
            return userArray.map((user) => user.username);
        },
        getAllEmails() {
            return userArray;
        },
        getAll() {
            return userArray;
        },
        getById(id) {
            return userArray.find((user) => user.id === id);
        },
        create(user) {
            return user;
        },
    },
};

const asyncFunc = async () => {
    return setTimeout(() => {
        throw new Error();
    }, 500);
};

describe('UserController', () => {
    describe('validateUserEmail', () => {
        describe('when data is valid', () => {
            it('expect to return the passed email', async () => {
                const email = 'user@domain.com';

                const controller = new UserController(fakeData);

                const validatedEmail =
                    await controller.validateUserEmail(email);

                expect(validatedEmail).to.eq(email);
            });
        });
        describe('when data is invalid', () => {
            it('expect to throw ExistingEmail exception', () => {
                const existingEmail = 'user@domain.com';

                const controller = new UserController(fakeData);

                userArray = [{
                    email: 'user@domain.com',
                }];

                controller.validateUserEmail(existingEmail).catch((rej) => {
                    expect(rej.message)
                        .to
                        .eq(new UserError.ExistingEmail().message);
                });

                // const func = () => {
                //     expect(func).to.throw(UserError.ExistingEmail);
                // };
            });
            it('expect to throw InvalidEmail exception', async () => {
                const existingEmail = 'userdomain.com';

                const controller = new UserController(fakeData);

                try {
                    await controller.validateUserEmail(existingEmail);
                } catch (err) {
                    expect(err.message)
                        .to
                        .eq(new UserError.InvalidEmail().message);
                }
            });
            it('expect to throw EmptyEmail exception', async () => {
                const existingEmail = '';

                const controller = new UserController(fakeData);

                try {
                    await controller.validateUserEmail(existingEmail);
                } catch (err) {
                    expect(err.message)
                        .to
                        .eq(new UserError.EmptyEmail().message);
                }
            });
            it('expect to throw NullEmail exception', async () => {
                userArray = null;
                const email = 'user@domain.com';

                const controller = new UserController(fakeData);

                try {
                    await controller.validateUserEmail(email);
                } catch (err) {
                    expect(err.message)
                        .to
                        .eq(new UserError.NullEmail().message);
                }
            });
        });
    });
    describe('validatePasswords', () => {
        describe('when data is valid', () => {
            it('expect to return the given password', () => {
                const pass = '123456';
                const confirmationPass = '123456';

                const controller = new UserController(fakeData);

                const validatedPassword =
                    controller.validatePasswords(pass, confirmationPass);

                expect(validatedPassword).to.be.eq(pass);
            });
        });
        describe('when data is invalid', () => {
            it('expect to throw NotMatchingPasswords exception', () => {
                const pass = '123456';
                const confirmationPass = '123';

                const controller = new UserController(fakeData);

                try {
                    controller.validatePasswords(pass, confirmationPass);
                } catch (err) {
                    expect(err.message)
                        .to
                        .eq(new UserError.NotMatchingPasswords().message);
                }
            });
            it('expect to throw ShortPassword exception', () => {
                const pass = '123';
                const confirmationPass = '123';

                const controller = new UserController(fakeData);

                try {
                    controller.validatePasswords(pass, confirmationPass);
                } catch (err) {
                    expect(err.message)
                        .to
                        .eq(new UserError.ShortPassword().message);
                }
            });
        });
    });
    describe('createUser', () => {
        describe('when data is valid', () => {
            it('expects to return the user we just created', async () => {
                userArray = [{
                    username: 'user1',
                    email: 'user1@domain.com',
                    password: '123456',
                    rePassword: '123456',
                    firstName: 'fName',
                    lastName: 'lName',
                }];
                const object = {
                    username: 'user',
                    password: '123456',
                    rePassword: '123456',
                    firstName: 'fName',
                    lastName: 'lName',
                    email: 'users@domain.com',
                };

                const controller = new UserController(fakeData);

                try {
                    const result = await controller.createUser(object);

                    // changing the properties cuz createUser returns object
                    // with properties names as the table columns
                    object.password = result.password;
                    object.first_name = object.firstName;
                    object.last_name = object.lastName;

                    delete object.rePassword;
                    delete object.firstName;
                    delete object.lastName;

                    expect(result).to.deep.eq(object);
                } catch (err) {
                    console.log(err);
                }
            });
        });
        describe('when data is invalid', () => {
            describe('when validateUsername() throws exception', () => {
                it('expect to throw any exception', async () => {
                    userArray = [{
                        username: 'name',
                    }];
                    const object = {
                        username: '',
                    };

                    const controller = new UserController(fakeData);

                    try {
                        await controller.createUser(object);
                    } catch (err) {
                        expect(err.message)
                            .to
                            .eq(new UserError.EmptyUsername().message);
                    }
                });
            });
            describe('when validatePassword() throws exception', () => {
                it('expect to throw any exception', async () => {
                    userArray = [{
                        username: 'name',
                    }];
                    const object = {
                        username: 'user',
                        password: '123456',
                        rePassword: '123',
                    };

                    const controller = new UserController(fakeData);

                    try {
                        await controller.createUser(object);
                    } catch (err) {
                        expect(err.message)
                            .to
                            .eq(new UserError.NotMatchingPasswords().message);
                    }
                });
            });
            describe('when validateUserEmail() throws exception', () => {
                it('expect to throw any exception', async () => {
                    const object = {
                        username: 'user',
                        password: '123456',
                        rePassword: '123456',
                        email: 'domain', // the wrong data
                    };

                    const controller = new UserController(fakeData);

                    const func = () => {
                        return controller.createUser(object);
                    };

                    return expect(func())
                        .to.be.rejectedWith(UserError.InvalidEmail);
                });
            });
        });
    });
});