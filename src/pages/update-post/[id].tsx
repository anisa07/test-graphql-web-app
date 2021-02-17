import { Box, Link, Button } from "@chakra-ui/react";
import { Formik, Form } from "formik";
import { withUrqlClient } from "next-urql";
import { useRouter } from "next/dist/client/router";
import React from "react";
import { InputField } from "../../components/InputField";
import { Layout } from "../../components/Layout";
import { useUpdatePostMutation, useMeQuery, usePostQuery } from "../../generated/graphql";
import { createUrqlClient } from "../../utils/createUrqlClient";
import { useIsAuth } from "../../utils/useIsAuth";

export const EditPost: React.FC<{}> = ({ }) => {
    const router = useRouter();
    const postId = typeof router.query.id === 'string' ? parseInt(router.query.id) : -1;

    const [{ data, fetching }] = usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId
        }
    })

    console.log(data)

    const [, update] = useUpdatePostMutation();

    useIsAuth();


    return (
        <Layout variant="small">
            {
                data?.post ? (
                    <Formik
                        initialValues={{ title: data?.post?.title || "", text: data?.post?.text || "" }}
                        onSubmit={async (values, { setErrors }) => {
                            const response = await update({ id: postId, options: values });
                            if (!response?.error) {
                                router.push("/");
                            }
                        }}
                    >
                        {({ isSubmitting }) => (
                            <Form>
                                <InputField name="title" label="Title" placeholder="title" />
                                <InputField
                                    textarea={true}
                                    name="text"
                                    label="Text"
                                    placeholder="post...."
                                />
                                <Box mt={4}>
                                    <Button
                                        type="submit"
                                        colorScheme="green"
                                        isLoading={isSubmitting}
                                    >
                                        Update Post
                            </Button>
                                </Box>
                            </Form>
                        )}
                    </Formik>

                ) : (
                        <Box>Post Not Found</Box>
                    )
            }
        </Layout>
    );
};

export default withUrqlClient(createUrqlClient)(EditPost);
