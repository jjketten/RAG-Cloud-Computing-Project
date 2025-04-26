# Cloud-Based RAG System for IT Helpdesk Tickets
This project demonstrates the use of Retrieval-Augmented Generation (RAG) to power intelligent, real-time support for IT helpdesk queries. It combines Azure AI Search for real-time information retrieval and DeepSeek’s LLM to generate accurate, context-aware responses to support requests.

## Getting Started
To run the project locally:
### 1. Clone the repository
```
git clone https://github.com/ItsJenny1/RAG-Cloud-Computing-Project.git
```
### 2. Navigate to frontend folder
```
cd RAG-Cloud-Computing-Project/frontend
```
### 3. Install dependencies
```
npm install
```
### 4. Start the development server
```
npm start
```
### 5. Open the app
Visit http://localhost:5173 in your browser

## Dataset
This system retrieves information and generates responses based on the **Help Desk Ticket dataset** adapted from:<br>
🔗 **Tobias Bueck** – [Kaggle Dataset](https://www.kaggle.com/datasets/tobiasbueck/multilingual-customer-support-tickets)<br>
📜 Licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

## Further information:
 - Note there are several hardcoded URLs that may need to be changed if setting this up in your own Azure environment.
 - The frontend can be set up with a web server of your choice. It is written in React & Javascript. Ensure Node Package Manager is installed.
   - You can also access it using https://jjketten.github.io/RAG-Cloud-Computing-Project/
 - The backend is also written in Javascript. It is designed to be uploaded to Azure as a 'serverless' Azure Function (for instance, using the VSCode Azure Functions extension). The API keys for Azure AI Search and Deepseek are stored as environment variables in Azure Function portal, and CORS settings may need to be changed.
   - Our 'live' backend can also be used if the hardcoded URLs are unchanged. 
   - If you would like to set up your own Azure AI Search and & clean_dataset.json, make sure to parse using "JSON lines" when setting up the indexer. More on parsing modes here: https://learn.microsoft.com/en-us/azure/search/search-howto-index-json-blobs . More explanation on our Azure setup is in the project report.  
