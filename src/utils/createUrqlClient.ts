import { dedupExchange, Exchange, fetchExchange } from 'urql';
import { cacheExchange, Resolver, Cache } from '@urql/exchange-graphcache';
import { LogoutMutation, MeQuery, MeDocument, LoginMutation, RegisterMutation, ChangePasswordMutation, CreatepostMutation, VoteMutationVariables, DeletePostMutationVariables } from '../generated/graphql';
import { updateQuery } from './updateQuery';
import { pipe, tap } from 'wonka';
import Router from "next/router";
import gql from 'graphql-tag';

const errorExchange: Exchange = ({ forward }) => ops$ => {
  return pipe(
    forward(ops$),
    tap(({ error }) => {
      if (error?.message.includes("Not authenticated")) {
        Router.replace("/login");
        return;
      }
    })
  )
}

import { stringifyVariables } from '@urql/core';
import { isServer } from './isServer';

export type MergeMode = 'before' | 'after';

export interface PaginationParams {
  offsetArgument?: string;
  limitArgument?: string;
  mergeMode?: MergeMode;
}

export const cursorPagination = (): Resolver => {
  return (_parent, fieldArgs, cache, info) => {
    const { parentKey: entityKey, fieldName } = info;
    const allFields = cache.inspectFields(entityKey);
    const fieldInfos = allFields.filter(info => info.fieldName === fieldName);
    const size = fieldInfos.length;
    if (size === 0) {
      return undefined;
    }

    const isItInTheCache = cache.resolve(entityKey, `${fieldName}(${stringifyVariables(fieldArgs)})`);
    info.partial = !isItInTheCache;
    const results: string[] = [];
    let hasMore: boolean = false;
    fieldInfos.forEach(fi => {
      if (fi.fieldName === 'posts') {
        const key = cache.resolve(entityKey, fi.fieldKey) as string;
        const data = cache.resolve(key, 'posts') as string[];
        hasMore = cache.resolve(key, 'hasMore') as boolean;
        results.push(...data);
      }
    });

    return {
      __typename: 'PaginatedPosts',
      hasMore,
      posts: results
    }
  }
};

const clearCache = (cache: Cache) => {
  const allFields = cache.inspectFields('Query');
  const fieldInfos = allFields.filter(info => info.fieldName === 'posts');
  fieldInfos.forEach(fInfo => {
    cache.invalidate('Query', 'posts', fInfo.arguments || {});
  })
}


export const createUrqlClient = (ssrExchange: any, ctx: any) => { 
  let cookie = '';
  if(isServer()) {
    cookie = ctx?.req.headers.cookie;
  } else {
    console.log('ctx', ctx)
  }
  return ({
  url: "http://localhost:4000/graphql",
  fetchOptions: {
    credentials: "include" as const,
    headers: cookie ? {
      cookie
    } : undefined
  },
  exchanges: [dedupExchange, cacheExchange({
    keys: {
      PaginatedPosts: () => null
    },
    resolvers: {
      Query: {
        posts: cursorPagination()
      }
    },
    updates: {
      Mutation: {
        deletePost: (_result, _args, cache, info) => {
          console.log(_result)
          if(_result.deletePost) {
            cache.invalidate({__typename: 'Post', id: (_args as {id: number}).id})
          }
        },
        vote: (_result, _args, cache, info) => {
          const { postId, value } = _args as VoteMutationVariables;
          // get current points
          const data: any = cache.readFragment(gql`
              fragment _ on Post {
                id
                points
                voteStatus
              }
            ` , { id: postId });
          if (data && data.voteStatus !== value) {
            const newPoints = data.points + ((!data.voteStatus ? 1 : 2)*value);
            cache.writeFragment(
              gql`
              fragment __ on Post {
                id
                points
                voteStatus
              }
            `, { id: postId, points: newPoints, voteStatus: value }
            )
          }
        },
        createPost: (_result, _args, cache, info) => {
          clearCache(cache)
        },
        logout: (_result, _args, cache, info) => {
          updateQuery<LogoutMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => ({ me: null })
          )
        },
        changePassword: (_result, args, cache, info) => {
          updateQuery<ChangePasswordMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.changePassword.errors) {
                return query;
              } else {
                return {
                  me: result.changePassword.user
                }
              }
            }
          )
        },
        login: (_result, args, cache, info) => {
          updateQuery<LoginMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.login.errors) {
                return query;
              } else {
                return {
                  me: result.login.user
                }
              }
            }
          );
          clearCache(cache);
        },
        register: (_result, args, cache, info) => {
          updateQuery<RegisterMutation, MeQuery>(
            cache,
            { query: MeDocument },
            _result,
            (result, query) => {
              if (result.register.errors) {
                return query;
              } else {
                return {
                  me: result.register.user
                }
              }
            }
          )
        }
      }
    }
  }), errorExchange, ssrExchange, fetchExchange]
})};
