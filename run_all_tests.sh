#!/bin/bash

# Run Python tests (assumes pytest is used and all python test folders are in the root)
echo "Running Python tests..."
cd tests
pytest || exit 1

# Run marketplace (frontend) tests
cd ../marketplace || exit 1
echo "Running marketplace (frontend) tests..."
# Use npm, pnpm, or yarn as appropriate. Here we use npm:
npm test || exit 1

cd ..
echo "All tests completed."
