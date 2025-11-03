from planner import get_structured_trip_details
from planner import  run_step2
from planner import  process_spots
from planner import  optimize_day_plan
from planner import  format_itinerary_with_llm
from planner import  run_itinerary_pipeline
if __name__ == "__main__":
    import json
    from colorama import Fore, Style
    import asyncio
    from datetime import datetime
    import json

    # Example user query
    prompt_1 = (
        "tripplan to afericaa for 3 days for 7 members 25k budget"
    )

    print(f"user query is : {prompt_1}\n\n")


    # Helper function to log time difference
    def log_time(step_name, start_time, end_time):
        duration = (end_time - start_time).total_seconds()
        print(f"{Fore.MAGENTA}⏱️  {step_name} took {duration:.2f} seconds{Style.RESET_ALL}\n")
        return duration


    # Start overall timer
    overall_start = datetime.now()
    print(f"{Fore.YELLOW}🚀 Process started at: {overall_start.strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}\n")

    # STEP 1: Understanding User Intent
    print(f"{Fore.CYAN}{'-' * 50}\n🎯 STEP 1: Understanding User Intent\n{'-' * 50}{Style.RESET_ALL}")
    start_step1 = datetime.now()
    trip1 = get_structured_trip_details(prompt_1)

    end_step1 = datetime.now()
    print("\nStructured Intent Response:\n")
    print(trip1.model_dump_json(indent=2))
    step1_time = log_time("STEP 1 (Understanding User Intent)", start_step1, end_step1)
    # log_process("STEP 1 - Understanding User Intent", step1_time)

    # STEP 2: Destination + Spots + Hotels
    print(f"\n{Fore.CYAN}{'-' * 50}\n📍 STEP 2: Destination + Spots Search + Hotel Search\n{'-' * 50}{Style.RESET_ALL}")
    start_step2 = datetime.now()
    # step2 = run_step2(trip1.model_dump())
    step2 = asyncio.run(run_step2(trip1.model_dump()))
    end_step2 = datetime.now()
    print(json.dumps(step2, indent=2))
    step2_time = log_time("STEP 2 (Destination + Spots + Hotels)", start_step2, end_step2)
    # log_process("STEP 2 - Destination + Spots Search + Hotel Search", step1_time)

    # STEP 3: Distance + Cost Estimation
    print(f"\n{Fore.GREEN}{'-' * 50}\n🛣️ STEP 3: Distance + Cost Estimation\n{'-' * 50}{Style.RESET_ALL}")
    start_step3 = datetime.now()
    step3 = asyncio.run(process_spots(step2))
    end_step3 = datetime.now()
    print(json.dumps(step3, indent=2))
    step3_time = log_time("STEP 3 (Distance + Cost Estimation)", start_step3, end_step3)

    # STEP 3: Bridge Conversion + LLM Formatting
    print(f"\n{Fore.YELLOW}{'-' * 50}\n🧩 Bridge: Step 3 → Step 4 Conversion\n{'-' * 50}{Style.RESET_ALL}")
    start_step4 = datetime.now()
    python_output = optimize_day_plan(step2, step3)
    final_itinerary = format_itinerary_with_llm(python_output, prompt_1)
    end_step4 = datetime.now()
    print("\nLLM Formatted Itinerary:\n")
    print(json.dumps(final_itinerary, indent=2))
    step4_time = log_time("STEP 3 to 4 (Itinerary Optimization + LLM Formatting)", start_step4, end_step4)

    # STEP 5–6: Weather + Enhancements + Final Itinerary
    print(
        f"\n{Fore.MAGENTA}{'=' * 50}\n🌦️ STEP 4 & 5 & STEP 6: Weather ✓ Final Itinerary ✓ Enhancements ✓\n{'=' * 50}{Style.RESET_ALL}"
    )
    start_step5 = datetime.now()
    result = asyncio.run(run_itinerary_pipeline(final_itinerary))

    end_step5 = datetime.now()
    print("\n📌 FINAL RESULT:\n")
    print(json.dumps(result, indent=2))
    step5_time = log_time("STEP 5–6 (Weather + Final Enhancements)", start_step5, end_step5)

    # END — Calculate total duration
    overall_end = datetime.now()
    overall_duration = (overall_end - overall_start).total_seconds()

    print(f"{Fore.GREEN}✅ DONE! Your trip plan has been successfully generated 🥳✨{Style.RESET_ALL}")
    print(f"{Fore.CYAN}📆 Process finished at: {overall_end.strftime('%Y-%m-%d %H:%M:%S')}{Style.RESET_ALL}")
    print(f"{Fore.BLUE}🕒 TOTAL EXECUTION TIME: {overall_duration:.2f} seconds{Style.RESET_ALL}")

    # Summary of all step durations
    print(f"\n{Fore.WHITE}{'=' * 50}")
    print(f"⏱️  Execution Time Summary:")
    print(f"  Step 1: {step1_time:.2f}s")
    print(f"  Step 2: {step2_time:.2f}s")
    print(f"  Step 3: {step3_time:.2f}s")
    print(f"  Step 3-4 convertor: {step4_time:.2f}s")
    print(f"  Step 4-5–6: {step5_time:.2f}s")
    print(f"{'-' * 50}")
    print(f"  🕒 Total Time: {overall_duration:.2f}s")
    print(f"{'=' * 50}{Style.RESET_ALL}")