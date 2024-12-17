import { InvalidCredentialsError } from "./errors/invalid-credentials-error";
import { expect, test, describe, it, beforeEach } from "vitest";

import { compare, hash } from "bcryptjs";
import { InMemoryUsersRepository } from "@/repositories/in-memory/in-memory-users-repository";

import { AuthenticateUseCase } from "./authenticate";

let usersRespository: InMemoryUsersRepository;
let sut: AuthenticateUseCase;

describe("Authenticate Use Case", () => {
  beforeEach(() => {
    usersRespository = new InMemoryUsersRepository();
    sut = new AuthenticateUseCase(usersRespository); // sut = system under test
  });
  it("should be able to authenticate", async () => {
    await usersRespository.create({
      name: "John",
      email: "john@email.com",
      password_hash: await hash("123456", 6),
    });

    const { user } = await sut.execute({
      email: "john@email.com",
      password: "123456",
    });

    expect(user.id).toEqual(expect.any(String));
  });

  it("should be able to authenticate with wrong email", async () => {
    await expect(() =>
      sut.execute({
        email: "john@email.com",
        password: "123456",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });

  it("should be able to authenticate with wrong password", async () => {
    await usersRespository.create({
      name: "John",
      email: "john@email.com",
      password_hash: await hash("123456", 6),
    });

    await expect(() =>
      sut.execute({
        email: "john@email.com",
        password: "123123",
      })
    ).rejects.toBeInstanceOf(InvalidCredentialsError);
  });
});
