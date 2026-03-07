#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" <<-EOSQL
  CREATE DATABASE cart_db;
  CREATE DATABASE purchase_db;
  CREATE DATABASE product_db;
EOSQL
