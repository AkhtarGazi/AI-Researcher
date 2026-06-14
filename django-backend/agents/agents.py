import os
from dotenv import load_dotenv
from langchain_mistralai import ChatMistralAI
from langchain_community.tools.tavily_search import TavilySearchResults
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langgraph.prebuilt import create_react_agent

# Load environment variables
load_dotenv()

# Initialize LLM
llm = ChatMistralAI(model="mistral-large-latest")

def build_search_agent():
    """Builds an agent that can search the web using Tavily."""
    tools = [TavilySearchResults(max_results=5)]
    agent = create_react_agent(llm, tools)
    return agent

def build_reader_agent():
    """Builds an agent that can read and scrape content from URLs."""
    # For now, we reuse the search agent or a specialized version
    # In a real scenario, this might use BeautifulSoup or a scraper tool
    tools = [TavilySearchResults(max_results=2)] 
    agent = create_react_agent(llm, tools)
    return agent

# Report Writing Chain
writer_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a professional research writer. Academic, objective, and thorough."),
    ("user", "Write a detailed research report on the topic: {topic}\n\nBase your report on the following research data:\n{research}")
])
writer_chain = writer_prompt | llm | StrOutputParser()

# Critique/Evaluation Chain
critic_prompt = ChatPromptTemplate.from_messages([
    ("system", "You are a critical reviewer. Evaluate the report for accuracy, depth, and clarity. Provide a score out of 10."),
    ("user", "Please review the following research report:\n{report}")
])
critic_chain = critic_prompt | llm | StrOutputParser()
