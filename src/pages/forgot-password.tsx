import { Box, Button } from "@chakra-ui/react";
import { Form, Formik } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/router";
import React from "react";
import { InputField } from "../components/InputField";
import { Wrapper } from "../components/Wrapper";
import { useForgotPasswordMutation } from "../generated/graphql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const router = useRouter();
  const [complete, setComplete] = React.useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();

  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values, { setErrors }) => {
          const response = await forgotPassword(values);
          setComplete(true);
        }}
      >
        {({ isSubmitting }) => (
          <Form>
            {!complete && (
              <>
                <InputField
                  name="email"
                  label="Email"
                  type={"email"}
                  placeholder={"sample@email.com"}
                />
                <Box mt={4}>
                  <Button
                    type="submit"
                    colorScheme="green"
                    isLoading={isSubmitting}
                  >
                    Forgot password
                  </Button>
                </Box>
              </>
            )}
            {complete && (
              <Box mt={4}>If an account with such mail exists than reset password link will be there</Box>
            )}
          </Form>
        )}
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
