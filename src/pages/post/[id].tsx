import { Box, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import { withUrqlClient } from 'next-urql';
import { useRouter } from 'next/router';
import React from 'react';
import { Layout } from '../../components/Layout';
import { usePostQuery } from '../../generated/graphql';
import { createUrqlClient } from '../../utils/createUrqlClient';

interface PostProps {

}

const Post = () => {
    const router = useRouter();
    const postId = typeof router.query.id  === 'string' ?  parseInt( router.query.id ) : -1;
    
    const [{data, fetching}] = usePostQuery({
        pause: postId === -1,
        variables: {
            id: postId
        }
    })
    
    return (<Layout>
        <Stack spacing={8}>
            <Box p={5} shadow="md" borderWidth="1px">
                {data?.post ? (
                    <>
                        <Heading fontSize="xl">{data.post?.title}</Heading>
                        <Text mt={4}>{data.post?.text}</Text>
                    </>
                ) : (
                    <Box>
                        Post does not exist
                    </Box>
                )}
            </Box>
        </Stack>
    </Layout>)
}

export default withUrqlClient(createUrqlClient, {ssr: true})(Post);
