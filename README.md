# Fitness Deck - AI Sourced

![Last Commit](https://img.shields.io/github/last-commit/Siphon880gh/fitness-deck/main) <a target="_blank" href="https://github.com/Siphon880gh" rel="nofollow"><img src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub" alt="Github" data-canonical-src="https://img.shields.io/badge/GitHub--blue?style=social&logo=GitHub"></a>
<a target="_blank" href="https://www.linkedin.com/in/weng-fung/" rel="nofollow"><img src="https://img.shields.io/badge/LinkedIn-blue?style=flat&logo=linkedin&labelColor=blue" alt="Linked-In" data-canonical-src="https://img.shields.io/badge/LinkedIn-blue?style=flat&amp;logo=linkedin&amp;labelColor=blue"></a>
<a target="_blank" href="https://www.youtube.com/@WayneTeachesCode/" rel="nofollow"><img src="https://img.shields.io/badge/Youtube-red?style=flat&logo=youtube&labelColor=red" alt="Youtube" data-canonical-src="https://img.shields.io/badge/Youtube-red?style=flat&amp;logo=youtube&amp;labelColor=red"></a>  

By Weng Fei Fung. All possible exercises and their progression variations according to AI. These exercises are for flexibility, mobility, and strength training.

## Live Demo

[Visit Weng's Fitness Deck](https://wengindustry.com/tools/fitness-deck/)


## Exercise Administration

md-file levels can only be one folder deep. Then inside a folder has MD files. 

Here proves it:
```
const fileName = dir.split("/")[1];
```

The foldername would be at `[0]`

Developers can feel free to contribute to a multi level organization. I recommend counting the forward slashes then using hash or other data structure, to track and then render the listing differently.


## Prompts

### Bodyweight exercises:

#### Prompts A-B Explained

The first column must be exercise number because the ChatGPT has a problem of keeping restarting the table because it's so many exercises and then it'd get cut off at the last row, and it would restart from the top of the tabale when you ask it to continue where it got cut off. By having an exercise number, you can forcefully tell it on the next prompt to continue from a certain exercise number.

#### Prompt A (Not Shoulder):
```
Give me as many exercises as possible to: improve the aesthetics of the Quadriceps as a male bodybuilder with minimal or no equipment. Because I have minimum equipment, bodyweight exercises are acceptable. I do have resistance bands, bosu, medicine ball, and dumbbells.

That is the goal of the prompt. Please remember that goal for all subsequent prompts.

Please give me a markdown table. Column 1 is the primary key or exercise number. Column 2 are the exercise names. Column 3 explains how the exercise contributes to body aesthetics if applicable. Column 4 and onwards are 5 columns that give the easier and harder variations based on difficulty level. Those 5 columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.
```

#### Prompt A (Shoulder):
```
Give me as many exercises as possible to: improve the aesthetics of the Shoulders as a male bodybuilder with minimal or no equipment. Because I have minimum equipment, bodyweight exercises are acceptable. I do have resistance bands, bosu, medicine ball, and dumbbells.

That is the goal of the prompt. Please remember that goal for all subsequent prompts.

Please give me a markdown table. Column 1 is the primary key or exercise number. Column 2 is the exercise names. Column 3 to describe if it's focused mostly on anterior, posterior, and/or lateral. Next column explains how the exercise contributes to body aesthetics if applicable. Next 5 columns give the easier and harder variations based on difficulty level. Those 5 columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.
```

I'd swap out the back with another muscle group. You can swap out male or female, or leave out the gender.


#### Prompt B (may be repeated):
```
Is this a good place to stop? Stop if it's going to be all slight variations. Otherwise, try to give as many as possible so I can ask you less often. Please do not have duplicates. Continue from the last row. Tell me how many exercises so far after the table. Please remember I do not have barbells, cable machine, and kettlebells.
```


#### Prompt B (if it looked like the last row in the table was cut off):
```
Was it cut off? Please continue if it was cut off from exercise number __
```
Abs: https://chat.openai.com/c/cc72d8f5-40de-4996-b10a-a7883dde64c0
Back: https://chat.openai.com/c/bfa87ce3-aa4d-4344-9adb-4474fb3d9c4a
Biceps: https://chat.openai.com/c/b3f5d0ec-7579-44f3-a17d-5c822dacc4cf
Calf: https://chat.openai.com/c/0fe64d6c-6b0c-4f37-a6af-83b7702d8c51
Chest: https://chat.openai.com/c/b5f435bb-278e-46f8-a0d9-3997a3cee022
Hamstrings: https://chat.openai.com/c/d6d87f94-7496-4cc0-9db0-47c26aa7b54c
Lats: https://chat.openai.com/c/ac1c3f0e-9d10-4ab8-a80a-33d120d3c03d
Quadriceps: https://chat.openai.com/c/4500b7b8-2499-47cf-a429-eade8efe8452
Shoulders: https://chat.openai.com/c/04a77b21-3187-417a-83e9-be527e7aea76
Triceps: https://chat.openai.com/c/1bd82a6a-2097-4050-8ba7-ee58453d48dd

### Cardio 10-Minute Burns:

#### Prompts A:

```
I want exercises and progressions from easiest, easier, standard, harder, and hardest variations for: drills to burn calories.

Give me a table of exercises. Column 1 are the exercises and drills; for example, monster walk or high knee jumps. Then column 2 and onwards are the progressions or variation 
```

#### Prompt B:

```
Are there more? You can draw from basketball drills, dancing, anything, as long as it is intense enough to burn calories with.
```

#### Prompt C:

```
Are there more? Make sure they burn enough calories and can be done long enough to be worth being in your table.
```

#### Prompt D:

```
Is this a good place to stop? Stop if it's going to be all slight variations. I want drills, dances, etc that can be done at home that can be great for burning off fat. Please do not have duplicates. Continue from the last row. Tell me how many exercises so far after the table.
```

https://chat.openai.com/c/148c9189-0994-447c-8e7a-f5a6757347f2


### Stretches (except Shoulders):

#### Prompts A-B

#### Prompt A:
```
Give me as many exercises as possible to: Stretch the quadriceps with a focus on increasing flexibility. 

That is the goal of the prompt. Please remember that goal for all subsequent prompts.

Please give me a markdown table. First column are the exercises. In 5 columns, give the easier and harder variations based on difficulty level. Those columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.
```

But notice I'd swap out quadriceps.

#### Prompt B (may be repeated):
```
Is this a good place to stop? Stop if it's going to be all slight variations. Otherwise, try to give as many as possible so I can ask you less often. Please do not have duplicates. Tell me how many exercises so far after the table.
```

#### Prompt B (if it looked like the last row in the table was cut off):
```
Was it cut off? Please continue if it was cut off
```

#### Prompt B (if you spot checked many repeats and slight variations):
```
Is this a good place to stop? I see some repeated exercises and slight variations
```

### Stretches - Shoulders

#### Prompts A-B

##### Prompt A appended:
Same as "Stretches (except Shoulders)" Prompt A but added:
```
Add a column to describe if it's focused mostly on anterior, posterior, or lateral.
```

##### Prompt B is instead:
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
Neck: https://chat.openai.com/c/8621ff15-ed79-4fa5-9ce1-f05c6ab5f639
Qaudricceps: https://chat.openai.com/c/ed46cc6f-986c-4391-a9f7-c8d05d0576a6
Shins: https://chat.openai.com/c/a44104f8-b9db-4548-98c3-fa7b9eb0b074
Shoulders: https://chat.openai.com/c/cc9e413d-a969-4700-8b7f-14c4522c8494
Triceps: https://chat.openai.com/c/3e21f128-7b29-435b-af76-5b0b6fa55994

### Mobility: 

#### Prompts A-D

#### Prompt A:
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

#### Prompt B:
```
Please change them into a Markdown table with the columns: Exercise name, Movement pattern. All exercises must be unique at the column Exercise name. Allow duplicates at the column Movement pattern. 
```

#### Prompt C:
```code
Please add 5 columns that give the easier and harder variations based on difficulty level. Those columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.
```

#### Prompt D (if it looked like the last row in the table was cut off):
```
Was it cut off? Please continue if it was cut off
```

https://chat.openai.com/c/1a35beb7-a105-4a96-841f-1f4d5db2bca5
https://chat.openai.com/share/a4f633c4-4eeb-4c2c-8504-a7c2ed907388

### Rehab - Shin Splints:

#### Prompt
```
I keep getting shin splints from walking, jogging, running. Give me as many exercises as possible to rehab the shin splints and prevent future shin splints by getting rid of any vulnerabilities.

That is the goal of the prompt. Please remember that goal for all subsequent prompts.

Please give me a markdown table. First column are the exercises. In 5 columns, give the easier and harder variations based on difficulty level. Those columns are: Easiest Variation, Easier variation, Standard variation, Harder variation, Hardest variation.

Also, add a column explaining how the exercise helps the shin splint.
```

https://chat.openai.com/c/78c9c57d-9d29-4149-94c1-671e248f7c5e
https://chat.openai.com/share/12f25b92-210a-4f9f-a9fe-7822f9b65661

### Amending More AI to a Table

#### Stretch Hip Benefits

I needed another column to explain why the hip exercise is beneficial:

```
This is a markdown table of hip exercises and their variations by difficulty. These exercises improve flexibility, stability, mobility, etc. Please add a second column on how the standard variation helps improve the hip:

{Markdown format table goes here. Broken down to 10 rows including header and divider to respect ChatGPT input limit. May be even less if rows are wordy. Double check their response to check if cut off}
```

## Prompt Responses Copied and Formatted Into MD

I prompted ChatGPT for exercises and progression variations. Then I copied all the responses to their respective MD files. Cleaning the MD file, I used VS Code's search and replace with regex: 

Find: `(^[^|]*$)|\n\n`
Replace: (empty)

This regex removed all lines that don't have the character "|" or are blank lines, so explanations can be removed. Some manual removing of lines were necessary afterwards, particularly the header rows that kept repeating from subsequent prompts (I used OPT+Click / ALT+Click to select multiple rows then CMD+SHIFT+K to delete the selected rows).

If you had accidentally gotten a table response that you don't like, you can use VS Code to swap columns. For example, moving the last column to the start is:
Find: `^\|(.*)\|([\w\s\-'\(\)"]+\|)$`
Replace: `|$2$1|`

In another case, you could swap columns 1 and 2 with:
Find: `^\|([\w\s\-'\(\)"]+)\|([\w\s\-'\(\)"]+)\|(.*)\|`
Replace: `|$2|$1|$3|`

If you have a lot of rows at the MD file and you're looking for duplicates, you can open in Fitness Deck app and sort by exercise name to find the duplicates them remove them. If there are too many rows, you can copy the rows into Excel and Home -> "Format as Table", then sort the first column ascendingly. Then copy back to the MD file.

When doing bodybuilding AI prompts, you want to get an exercise number column as the first column for the explanation listed at the prompt. You may remove the first column that has the exercise number before publication with the app with the following Find and Replace, then DON'T FORGET to fix the header (remove the "Exercise No." header and divider):
Find: `^\|[0-9\.\s]+(\|.*)`
Replace: `$1`

## Future version

- Will have built in countdown timer, sets/reps counter. 
- Will load faster by bundling assets with webpack.
- Will load faster by rewriting code in plain javascript. To get rid of jQuery, will have to make DataTables not reliant on jQuery.