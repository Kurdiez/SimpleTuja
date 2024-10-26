import React, { useState } from "react";
import { useRouter } from "next/router";
import { register } from "@/utils/simpletuja/auth";
import { RegisterDto } from "@simpletuja/shared";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import Logo from "@/components/common/Logo";
import Button from "@/components/common/Button";

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleRegister = async (event: React.FormEvent) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    const registerDto: RegisterDto = { email, password };
    try {
      await register(registerDto);
      toast.success("Registration successful!");
      setIsRegistered(true);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as { message: string };
      toast.error(data.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[520px]">
      <div>
        <div onClick={handleLogoClick} className="cursor-pointer select-none">
          <Logo />
        </div>
        <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-100">
          {isRegistered ? "Account has been created!" : "Create your account"}
        </h2>
        {isRegistered ? (
          <p className="mt-2 text-sm leading-6 text-gray-400">
            A confirmation email has been sent. Please check your inbox.
          </p>
        ) : (
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Already have an account?{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                router.push("/sign-in");
              }}
              className="font-semibold text-primary hover:text-primary-light"
            >
              Sign in
            </a>
          </p>
        )}
      </div>

      {!isRegistered && (
        <div className="mt-10">
          <form onSubmit={handleRegister} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-100"
              >
                Email address
              </label>
              <div className="mt-2">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-100"
              >
                Password
              </label>
              <div className="mt-2">
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium leading-6 text-gray-100"
              >
                Confirm password
              </label>
              <div className="mt-2">
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm sm:leading-6"
                />
              </div>
            </div>

            <div>
              <Button type="submit" className="w-full mt-8" loading={isLoading}>
                Register
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default RegisterForm;
