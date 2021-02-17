import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";
import { useDeletePostMutation, usePostsQuery, useVoteMutation, useMeQuery } from "../generated/graphql";
import { Layout } from "../components/Layout";
import NextLink from "next/link";
import { Badge, Box, Button, CircularProgress, Flex, Heading, Link, Stack, Text } from "@chakra-ui/react";
import React, { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { IconButton } from "@chakra-ui/react"

const Index = () => {
  const [variables, setVariables] = useState({ limit: 15, cursor: null as null | string });
  const [{ data, fetching }] = usePostsQuery({
    variables,
  });
  const [{ data: meData, }] = useMeQuery();
  const [_, vote] = useVoteMutation();
  const [, deletePost] = useDeletePostMutation();

  return (
    <Layout>
      {!fetching && !data && <Heading fontSize="x-s">No posts found</Heading>}
      {!data && fetching && <CircularProgress isIndeterminate color="green.300" />}
      {data && data.posts && (
        <Stack spacing={8}>
          {data.posts!.posts.map((post) => !post ? null : (
            <Box p={5} shadow="md" borderWidth="1px" key={post.id}>
              <Flex alignItems={"center"}>
                <Box flex={1}>
                  <Flex alignItems="center">
                    <NextLink href={`/post/${post.id}`}>
                      <Link>
                        <Heading fontSize="xl">{post.title}</Heading>
                      </Link>
                    </NextLink>
                    <Text ml={2} fontSize={15}>Author: </Text>
                    <Badge ml={2} variant="outline" colorScheme="blackAlpha">{post.creator.username}</Badge>
                    {meData?.me?.id === post.creator.id && <><NextLink href={`/update-post/${post.id}`}>
                      <Link>
                        <IconButton ml={1} aria-label="edit post" icon={<EditIcon size="16px" />} />
                      </Link>
                    </NextLink>
                    <IconButton ml={1} aria-label="delete post" icon={<DeleteIcon size="16px" />} onClick={async () => { await deletePost({ postId: post.id }) }} /></>}
                  </Flex>
                  <Text mt={4}>{post.textSnippet}</Text>
                </Box>
                <Flex direction={"column"} alignItems={"center"} ml={2}>
                  <IconButton
                    aria-label="up vote"
                    onClick={async () => {
                      if (post.voteStatus === 1) {
                        return;
                      }
                      await vote({
                        postId: post.id, value: 1
                      })
                    }}
                    colorScheme={post.voteStatus === 1 ? "green" : ''}
                    icon={<ChevronUpIcon size="24px" />}
                  />
                  {post.points}
                  <IconButton
                    aria-label="down vote"
                    onClick={async () => {
                      if (post.voteStatus === -1) {
                        return;
                      }
                      await vote({
                        postId: post.id, value: -1
                      })
                    }}
                    colorScheme={post.voteStatus === -1 ? "red" : ''}
                    icon={<ChevronDownIcon size="24px"
                    />}
                  />
                </Flex>
              </Flex>
            </Box>
          ))}
        </Stack>
      )}
      {data && data.posts.hasMore && <Button
        my={5}
        colorScheme="green"
        isLoading={fetching}
        onClick={() => {
          setVariables({ limit: variables.limit, cursor: data.posts.posts[data.posts.posts.length - 1].createdAt })
        }}
      >
        Load More Posts
      </Button>}
    </Layout>
  );
};

export default withUrqlClient(createUrqlClient, { ssr: true })(Index);
