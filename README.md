# Fitness Deck - AI Sourced

![Last Commit](https://img.shields.io/github/last-commit/Siphon880gh/fitness-deck/main) <a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub"></a>
<a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://camo.githubusercontent.com/0f56393c2fe76a2cd803ead7e5508f916eb5f1e62358226112e98f7e933301d7/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f4c696e6b6564496e2d626c75653f7374796c653d666c6174266c6f676f3d6c696e6b6564696e266c6162656c436f6c6f723d626c7565" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue"></a>  <a target="_blank" href="https://www.youtube.com/user/Siphon880yt/" rel="nofollow"><img src="https://camo.githubusercontent.com/0bf5ba8ac9f286f95b2a2e86aee46371e0ac03d38b64ee2b78b9b1490df38458/68747470733a2f2f696d672e736869656c64732e696f2f62616467652f596f75747562652d7265643f7374796c653d666c6174266c6f676f3d796f7574756265266c6162656c436f6c6f723d726564" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red"></a>  

By Weng Fei Fung. All possible exercises and their progression variations according to AI. These exercises are for flexibility, mobility, and strength training.

## Live Demo

[Visit Weng's Fitness Deck](https://wengindustry.com/tools/fitness-deck/)


## Exercise Administration

md-file levels can only be one folder deep. Then inside a folder has MD files.


## Prompts Preface

I prompted ChatGPT for exercises and progression variations. Then I copied all the responses to their respective MD files. Cleaning the MD file, I used VS Code's search and replace with regex: 

```
(^[^|]*$)|\n\n
```

This regex removed all lines that don't have the character "|" or are blank lines, so explanations can be removed. Some manual removing of lines were necessary afterwards, particularly the header rows that kept repeating from subsequent prompts (I used OPT+Click / ALT+Click to select multiple rows then CMD+SHIFT+K to delete the selected rows).

If you had accidentally gotten a table response that you don't like, you can use VS Code to swap columns. For example, moving the last column to the start is:
Find: `^\|(.*)\|([\w\s\-'\(\)"]+\|)$`
Replace: `|$2$1|`

In another case, you could swap columns 1 and 2 with:
Find: `^\|([\w\s\-'\(\)"]+)\|([\w\s\-'\(\)"]+)\|(.*)\|`
Replace: `|$2|$1|$3|`

If you have a lot of rows at the MD file and you're looking for duplicates, you can open in Fitness Deck app and sort by exercise name to find the duplicates them remove them. If there are too many rows, you can copy the rows into Excel and Home -> "Format as Table", then sort the first column ascendingly. Then copy back to the MD file.

## Prompts

### Stretches (except Shoulders):

Prompts A-B

Prompt A:
```
Give me as many exercises as possible to: Stretch the quadriceps with a focus on increasing flexibility. 

That is the goal of the prompt. Please remember that goal for all subsequent prompts.

Please give me a markdown table. First column are the exercises. In 5 columns, give the easier and harder variations based on difficulty level. Those columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.
```

Prompt B (may be repeated):
```
Is this a good place to stop? It is if it's going to be all slight variations. Otherwise, try to give as many as possible so I can ask you less often. Please do not have duplicates. Tell me how many exercises so far after the table.
```

### Stretches - Shoulders

Prompts A-B

Same as "Stretches (except Shoulders)" Prompt A but added:
```
Add a column to describe if it's focused mostly on anterior, posterior, or lateral.
```

Prompt B is instead:
```
Are there any more exercises that focus on increasing flexibility of the Lateral deltoids that haven't been mentioned in your previous answers and are not dumbbell exercises? If so, please continue the table format for progressions.
```

But notice I'd swap out Lateral/Posterior/Anterior

Ankle: https://chat.openai.com/c/d8ee762f-80fe-42a4-a082-984e6b298d72
Back: https://chat.openai.com/c/ab8415c3-b82d-402f-b461-b89cd5af816f
Biceps: https://chat.openai.com/c/cc799b6d-179f-4bc6-ae95-1d7866edf1f7
Calf: https://chat.openai.com/c/73ea7d9e-ffca-49fc-ac80-f347cb6e456c
Chest: https://chat.openai.com/c/0a96d27b-a57c-45f7-8434-eb54fb4f2350
Hamstrings: https://chat.openai.com/c/c3dff058-3ae4-4a46-8a98-db7a1928b0f9
Hips: https://chat.openai.com/c/3e48edca-8bbb-4212-97e1-49baf6314edf
Lats: https://chat.openai.com/c/e148636d-468e-4b68-a3ab-1248429f1675
Qaudricceps: https://chat.openai.com/c/ed46cc6f-986c-4391-a9f7-c8d05d0576a6
Shins: https://chat.openai.com/c/a44104f8-b9db-4548-98c3-fa7b9eb0b074
Shoulders: https://chat.openai.com/c/cc9e413d-a969-4700-8b7f-14c4522c8494
Triceps: https://chat.openai.com/c/3e21f128-7b29-435b-af76-5b0b6fa55994

### Mobility: 
Prompts A-D

Prompt A:
```
I will give you a list of movement patterns that contribute to overall mobility and flexibility. Please list exercises underneath them.

1. Hip abduction
2. Hip Flexion
3. Hip Extension
4. Hip Adduction
5. Hip Internal Rotation
6. Hip External Rotation
7. Knee Flexion
8. Knee Extension
9. Ankle Dorsiflexion
10. Ankle Plantarflexion
11. Spinal Rotation
12. Spinal Flexion
13. Spinal Extension
14. Shoulder Flexion
15. Shoulder Extension
16. Shoulder Abduction
17. Shoulder Adduction
```

Prompt B:
```
Please change them into a Markdown table with the columns: Exercise name, Movement pattern. All exercises must be unique at the column Exercise name. Allow duplicates at the column Movement pattern. 
```

Prompt C:
```
Please add 5 columns that give the easier and harder variations based on difficulty level. Those columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.
```

Prompt D (may be repeated):
```
Was it cut off? Please continue if it was cut off
```


https://chat.openai.com/c/1a35beb7-a105-4a96-841f-1f4d5db2bca5
https://chat.openai.com/share/a4f633c4-4eeb-4c2c-8504-a7c2ed907388

### Rehab - Shin Splints:

Prompt
```
I keep getting shin splints from walking, jogging, running. Give me as many exercises as possible to rehab the shin splints and prevent future shin splints by getting rid of any vulnerabilities.

That is the goal of the prompt. Please remember that goal for all subsequent prompts.

Please give me a markdown table. First column are the exercises. In 5 columns, give the easier and harder variations based on difficulty level. Those columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.

Also, add a column explaining how the exercise helps the shin splint.
```

https://chat.openai.com/c/78c9c57d-9d29-4149-94c1-671e248f7c5e
https://chat.openai.com/share/12f25b92-210a-4f9f-a9fe-7822f9b65661