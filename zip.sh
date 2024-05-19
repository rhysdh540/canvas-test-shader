#!/bin/zsh

# add pack.mcmeta and assets/*
pack_name="$(basename "$(pwd)").zip"
zip -r9X "$pack_name" pack.mcmeta assets
ect -9 -zip --mt-deflate "$pack_name"