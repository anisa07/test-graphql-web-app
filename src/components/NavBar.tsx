import { Box, Button, Flex, Link } from "@chakra-ui/react";
import React from "react";
import NextLink from "next/link";
import { useLogoutMutation, useMeQuery } from "../generated/graphql";
import {useRouter} from 'next/router';

interface NavBarProps {}

export const NavBar: React.FC<NavBarProps> = ({ children }) => {
  const router = useRouter();
  const [{ data, fetching }] = useMeQuery();
  const [{fetching: logoutFetching}, logout] = useLogoutMutation();
  let body = null;

  if (!data?.me) {
    body = (
      <>
        <NextLink href="/login">
          <Link mr={4}>Login</Link>
        </NextLink>
        <NextLink href="/register">
          <Link>Register</Link>
        </NextLink>
      </>
    );
  } else {
    body = (
        <Flex>
            <Box mr={4}>{data.me.username}</Box>
            <Box mr={4}>
              <NextLink href="/create-post">
                <Link>Create Post</Link>
              </NextLink>
            </Box>
            <Button 
            variant={"link"} 
            isLoading={logoutFetching} 
            onClick={
              async () => {
                await logout();
                router.reload();
              }
            }>Logout</Button>
        </Flex>
    )
  }

  return (
    <Flex bg="salmon" position={'sticky'} top={0} zIndex={1} p={4}>
      <Box color={"white"} fontSize={20}>
        <NextLink href="/">
          <Link mr={4}>Home</Link>
        </NextLink>
      </Box>
      <Box ml={"auto"} color={"snow"}>
        {body}
      </Box>
    </Flex>
  );
};
