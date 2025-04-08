Overall Design changes:
Make it look like the first iteration of the application sent to osman


Command View changes

comment out, open in notion button

The Score Cards on top should not be clickable, just optimized for mobile and sidepane extension view.

Todays sync ups should allow for the following changes:
when I anywhere on the actual syncup descriptor box except for the hyperlinks like "join meeting", it should open a popup showing me a summary of the meeting details. When I click on the Join SyncUp, it should open the associated meeting link. 
When I click on the view All syncups text on the bottom fo the "Todays SycUps" scorecard, it should open a scrollable popup that shows me all upcoming meetings for the next two days.
for now, remove the schedule button.  

For recent missions, it should show me all recent missions/tasks that I have worked on, it should show me the title of the mission, last update time, and a snippet with the last update made.
clicking the plus sign on the recent missions score card, it should just add a new task, same as the new mission button in the quick actions does, if not reusing the same component. 
remove the filter option on the recent missions card for now. 

for the mindboard notes scorecard, new note should actual trigger the cretion of a new mindpage from the last currently used section. 
clicking on the mindboard note should redirect to that corresponding mindboard page. 

quickactions changes
change new syncup to be join meeting instead, requiring just the meeting link. 
new note should trigger a new mindpage. 
remove add to orbit, will remove this ui feature but will use this in the settings. 
where it says "Select an action from above to get started" in the bottom pane of the quick actions, change that to a button that says, invite your team. and make sure this button is also hidden when a user clicks collapse on the quick actions, the same way the text "Select an action from above to get started" would be hidden when executing the same action. 




the actionbot component

change coloring again according to major design schema change referenced in the "overall design changes" section. 
change logo to the action.it logo on the first box that display the following message:
"ActionBot Ready - Your engineering assistant is ready to help. What would you like to accomplish today?"

text from sample prompts that are displayed are extending beyond the borders of the chatbot bounding box, reframe, and include screenshot

the sidepane that opens the conversation tabs disapears and I can no longer close it. 
conversations need to be named accordingly, with a rename function. 
conversations names need to be generated from the initial prompt/response from the chatbot, similar to chatgpt. I also need project heirarchy similar to chat gpt. I will supply a description. 
need to implement the AI assistant quick action buttons on the ai chatbot for code review, summary, ect.. 

