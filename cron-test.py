"""
This file makes a simple request to the API to create a new user with a random username and password
"""
import string
import random

import requests


def main():
    """make api requests to create a random user"""
    user = {
        "username": generate_random_string(),
        "password": generate_random_string(),
        "address": {
            "city": generate_random_string(),
            "street": generate_random_string()
        }
    }
    url = "http://localhost:3000/api/signup"
    # save data to db via the server
    response = requests.post(url=url, json=user)
    return response


def generate_random_string():
    """generate a random string of 7 characters"""
    return ''.join(random.choice(string.ascii_lowercase) for _ in range(6))


if __name__ == "__main__":
    main()
