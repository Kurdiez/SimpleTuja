import AuthLayout from "@/components/common/AuthLayout";
import SignInForm from "@/components/pages/sign-in/SignInForm";

export default function Example(): JSX.Element {
  return (
    <AuthLayout>
      <SignInForm />
    </AuthLayout>
  );
}
