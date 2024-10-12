import React, { useState } from "react";
import { useRouter } from "next/router";
import { signIn } from "@/utils/simpletuja/auth";
import { SignInDto } from "@simpletuja/shared";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import { LocalStorageKey } from "@/utils/const";
import Logo from "@/components/common/Logo";
import { AppRoute } from "@/utils/app-route";

const SignInForm: React.FC = () => {
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleSignIn = async (event: React.FormEvent) => {
    event.preventDefault();

    const signInDto: SignInDto = { email, password };
    try {
      const response = await signIn(signInDto);
      toast.success("Sign-in successful!");
      localStorage.setItem(LocalStorageKey.AccessToken, response.accessToken);
      router.push(AppRoute.Dashboard);
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      const data = axiosError.response?.data as { message: string };
      toast.error(data.message);
    }
  };

  return (
    <div className="h-[520px]">
      <div>
        <div onClick={handleLogoClick} className="cursor-pointer select-none">
          <Logo fontSize="text-2xl" />
        </div>
        <h2 className="mt-8 text-2xl font-bold leading-9 tracking-tight text-gray-100">
          Sign in to your account
        </h2>
        <p className="mt-2 text-sm leading-6 text-gray-400">
          Not a member?{" "}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              router.push("/register");
            }}
            className="font-semibold text-primary hover:text-primary-light"
          >
            Register
          </a>
        </p>
      </div>

      <div className="mt-10">
        <form onSubmit={handleSignIn} className="space-y-6">
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
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full rounded-md border-0 py-1.5 px-3 text-black shadow-sm ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary-400 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm leading-6">
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  router.push("/forgot-password");
                }}
                className="font-semibold text-primary-400 hover:text-primary-300"
              >
                Forgot password?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="flex w-full justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignInForm;
