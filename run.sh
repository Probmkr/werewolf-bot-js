#!/bin/bash
echo "--------Registering command.--------"
yarn command
echo -n "continue?"
read
echo "--------Launching bot.--------------"
yarn test
