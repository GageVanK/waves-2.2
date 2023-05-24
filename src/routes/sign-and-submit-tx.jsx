import { ERROR_TYPES, identity, submitPost, getHotFeed } from "deso-protocol";
import { useContext, useRef, useEffect, useState } from "react";
import { UserContext } from "../contexts";

import {
  Button,
  Center,
  Space,
  Paper,
  Text,
  Textarea,
  Group,
  Loader,
  Avatar,
} from "@mantine/core";
import { getDisplayName } from "../helpers";

export const SignAndSubmitTx = () => {
  const { currentUser, isLoading } = useContext(UserContext);

  const formRef = useRef(null);

  if (isLoading) {
    return (
      <Center>
        <Loader variant="bars" />
      </Center>
    );
  }

  if (!currentUser || !currentUser.BalanceNanos) {
    return (
      <Center>
        <Button
          radius="xl"
          onClick={() => {
            identity
              .login({
                getFreeDeso: true,
              })
              .catch((err) => {
                if (err?.type === ERROR_TYPES.NO_MONEY) {
                  alert("You need DESO in order to post!");
                } else {
                  alert(err);
                }
              });
          }}
        >
          Login to Create
        </Button>
      </Center>
    );
  } else {
    return (
      <>
        <Paper m="md" shadow="lg" radius="sm" p="xl" withBorder>
          <form
            ref={formRef}
            onSubmit={async (e) => {
              e.preventDefault();
              const form = formRef.current;

              // check if the user can make a post
              if (
                !identity.hasPermissions({
                  TransactionCountLimitMap: {
                    SUBMIT_POST: 1,
                  },
                })
              ) {
                // if the user doesn't have permissions, request them
                // and abort the submit
                identity.requestPermissions({
                  GlobalDESOLimit: 10000000, // 0.01 DESO
                  TransactionCountLimitMap: {
                    SUBMIT_POST: 3,
                  },
                });
                return;
              }

              const body = form.elements.body.value;

              await submitPost({
                UpdaterPublicKeyBase58Check: currentUser.PublicKeyBase58Check,
                BodyObj: {
                  Body: body,
                  ImageURLs: [],
                  VideoURLs: [],
                },
              }).then((resp) => {
                console.log(resp);
                alert("Post submitted!");
              });

              // Reset the form after submission
              form.reset();
            }}
          >
            <Group>
              <Avatar
                size="lg"
                radius="lg"
                src={`https://node.deso.org/api/v0/get-single-profile-picture/${currentUser?.PublicKeyBase58Check}`}
                alt="Profile Picture"
              />
              <Text fz="lg" fw={777} variant="gradient" truncate>
                {getDisplayName(currentUser)}
              </Text>
            </Group>
            <Space h="sm" />
            <Textarea
              name="body"
              radius="md"
              autosize
              placeholder="Let them hear your voice!"
              variant="filled"
              size="md"
            />
            <Space h="sm" />
            <Group postion="apart">
              <Button
                variant="gradient"
                gradient={{ from: "cyan", to: "indigo" }}
                raduis="sm"
                type="submit"
              >
                Create
              </Button>
            </Group>
          </form>
        </Paper>
      </>
    );
  }
};
