#!/usr/bin/env python3
"""
Upstage Solar Pro2 LLM Test Script
Tests the Upstage API with both streaming and non-streaming modes
"""

from openai import OpenAI


def test_streaming():
    """Test with streaming enabled"""
    print("=" * 50)
    print("Testing Upstage Solar Pro2 with STREAMING")
    print("=" * 50)

    client = OpenAI(
        api_key="up_iAIdMjyRhvufE5JgVdjf49rymbBEI",
        base_url="https://api.upstage.ai/v1"
    )

    stream = client.chat.completions.create(
        model="solar-pro2",
        messages=[
            {
                "role": "user",
                "content": "안녕하세요! Upstage Solar Pro2 모델에 대해 간단히 소개해주세요."
            }
        ],
        stream=True,
    )

    print("\n[Response (Streaming)]:")
    for chunk in stream:
        if chunk.choices[0].delta.content is not None:
            print(chunk.choices[0].delta.content, end="", flush=True)

    print("\n" + "=" * 50 + "\n")


def test_non_streaming():
    """Test without streaming"""
    print("=" * 50)
    print("Testing Upstage Solar Pro2 WITHOUT STREAMING")
    print("=" * 50)

    client = OpenAI(
        api_key="up_iAIdMjyRhvufE5JgVdjf49rymbBEI",
        base_url="https://api.upstage.ai/v1"
    )

    response = client.chat.completions.create(
        model="solar-pro2",
        messages=[
            {
                "role": "user",
                "content": "Python에서 간단한 계산을 해주세요: 15 * 23 = ?"
            }
        ],
        stream=False,
    )

    print("\n[Response (Non-streaming)]:")
    print(response.choices[0].message.content)
    print("\n" + "=" * 50 + "\n")


def main():
    """Run both tests"""
    try:
        # Test 1: Streaming mode
        test_streaming()

        # Test 2: Non-streaming mode
        test_non_streaming()

        print("✓ All tests completed successfully!")

    except Exception as e:
        print(f"\n✗ Error occurred: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()
