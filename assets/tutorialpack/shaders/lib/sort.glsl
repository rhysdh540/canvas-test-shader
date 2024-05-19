struct Pair {
    vec4 color;
    float depth;
};

void swap6(Pair arr[6], int i, int j) {
    if(arr[i].depth > arr[j].depth) {
        Pair temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
}

void batcherSort6(Pair arr[6]) {
    // First stage of comparison and swapping
    swap6(arr, 0, 1);
    swap6(arr, 2, 3);
    swap6(arr, 4, 5);

    // Second stage of comparison and swapping
    swap6(arr, 0, 2);
    swap6(arr, 1, 3);
    swap6(arr, 4, 2);

    // Third stage of comparison and swapping
    swap6(arr, 1, 4);
    swap6(arr, 3, 5);

    // Fourth stage of comparison and swapping
    swap6(arr, 1, 2);
    swap6(arr, 3, 4);

    // Fifth stage of comparison and swapping
    swap6(arr, 2, 3);
}