// import { resolveHref } from "next/dist/next-server/lib/router/router";
import * as React from "react";
import { Formik, Form } from "formik";
import {
  Box,
  Button,
} from "@chakra-ui/react";
import { Wrapper } from "../components/Wrapper";
import { InputField } from "../components/InputField";
import { useRegisterMutation } from "../generated/graphql";
import { toErrormap } from "../utils/toErrorMap";
import { useRouter } from 'next/router';
import { createUrqlClient } from "../utils/createUrqlClient";
import { withUrqlClient } from 'next-urql';

interface RegisterProps {}

const REGISTER_MUT = `
mutation Register($username: String!, $password: String!) {
	register(options: {username: $username, password: $password}){
    user {
      id
      createdAt
      username
    }
    errors {
      field
      message
    }
  }
}
`;

const Register: React.FC<RegisterProps> = ({}) => {
  const router = useRouter();
  const [,register] = useRegisterMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "", username: "", password: "" }}
        onSubmit={async (values, {setErrors}) => {
          const response = await register({options: values});
          if(response.data?.register.errors) {
            setErrors(toErrormap(response.data?.register.errors));
          } else if (response.data?.register.user) {
            router.push("/");
          }
        }}
      >
        {({ values, handleChange, isSubmitting }) => (
          <Form>
            <InputField
              name="username"
              label="Username"
              placeholder={"Awesome_Panda"}
            />
             <InputField
              name="email"
              label="Email"
              placeholder={"email@email.com"}
              type="email"
            />
            <InputField
              name="password"
              label="Password"
              placeholder={"Supersecret_password"}
              type="password"
            />
            <Box mt={4}>
              <Button type="submit" colorScheme="green" isLoading={isSubmitting}>
                Register
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(Register)
