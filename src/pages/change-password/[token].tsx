import { Box, Button, Flex, Link } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { NextPage } from "next";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../../components/InputField";
import { Wrapper } from "../../components/Wrapper";
import { useChangePasswordMutation } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { toErrormap } from "../../utils/toErrorMap";
import NextLink from "next/link";

const ChangePassword: NextPage<{}> = () => {
  const router = useRouter();
  const [, changePassword] = useChangePasswordMutation();
  const [tokenError, setTokenError] = React.useState("");
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ newPassword: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await changePassword({
            password: values.newPassword,
            token: typeof router.query.token === "string" ? router.query.token : "",
          });
          if (response.data?.changePassword.errors) {
            const errorMap = toErrormap(response.data?.changePassword.errors);
            if ('token' in errorMap) {
                setTokenError(errorMap.token);
            }
            setErrors(errorMap);
          } else if (response.data?.changePassword.user) {
            router.push("/");
          }
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            <InputField
              name="newPassword"
              label="New Password"
              placeholder={"Supersecret_password"}
              type="password"
            />
            {!!tokenError && <Flex>
                <Box mr={2} style={{color: "tomato"}}>{tokenError}</Box>
                <NextLink href="/forgot-password">
                    <Link>click here to forget password again</Link>
                </NextLink>
            </Flex>}
            <Box m="10px 10px">
              <Button type="submit" colorScheme="green" isLoading={isSubmitting}>
                Change Password
              </Button>
            </Box>
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient, {ssr: false})(ChangePassword);
